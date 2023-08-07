/** @format */

import { LoaderArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import { storage } from '~/utils/session.server';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import type { V2_MetaFunction } from '@vercel/remix';

export const meta: V2_MetaFunction = () => [{ title: 'Daftar Pesanan | Dashboard Kasir' }];

export async function loader({ request }: LoaderArgs) {
  // Parse cookies from the request headers
  const session = await storage.getSession(request.headers.get('Cookie'));
  const getToken = session.get('token');

  // If the user is not logged in, redirect them to the login page
  if (!getToken) {
    return redirect('/login');
  }

  const decodedToken = decodeToken(getToken) as { role: string } | null;

  if (decodedToken && decodedToken.role == 'OWNER') {
    return redirect('/owner/');
  } else if (decodedToken && decodedToken.role == 'KOKI') {
    return redirect('/koki/');
  }

  // Parse the search query from the request URL
  const searchParams = new URLSearchParams(request.url.split('?')[1]);
  const searchQuery = searchParams.get('search') || '';
  const filterStatusQuery = searchParams.get('status') || '';

  const validateDateQuery = (startDate: any, endDate: any) => {
    const currentDate = new Date();
    const removeCurrentDateTime = currentDate.toISOString().split('T')[0];
    let result = '';

    if (startDate != '' && endDate != '') {
      if (filterStatusQuery != '') {
        result = `,startDate=gt.${startDate},endDate=lt.${endDate}`;
      } else {
        result = `startDate=gt.${startDate},endDate=lt.${endDate}`;
      }
    } else if (startDate != '' && endDate == '') {
      if (filterStatusQuery != '') {
        result = `,startDate=gt.${startDate},endDate=lt.${removeCurrentDateTime}`;
      } else {
        result = `startDate=gt.${startDate},endDate=lt.${removeCurrentDateTime}`;
      }
    } else if (startDate == '' && endDate != '') {
      const endDateYesterdays = new Date(endDate);
      endDateYesterdays.setDate(endDateYesterdays.getDate() + -1);
      const removeEndDateYesterdaysTime = endDateYesterdays.toISOString().split('T')[0];
      if (filterStatusQuery != '') {
        result = `,startDate=gt.${removeEndDateYesterdaysTime},endDate=lt.${endDate}`;
      } else {
        result = `startDate=gt.${removeEndDateYesterdaysTime},endDate=lt.${endDate}`;
      }
    }
    return result;
  };

  const filterStartDateQuery = searchParams.get('startDate') || '';
  const filterEndDateQuery = searchParams.get('endDate') || '';
  // const filterQuery =
  //   (filterStatusQuery && `status=iLike.${filterStatusQuery},`) +
  //   (filterStartDateQuery && `startDate=gt.${filterStartDateQuery}`) +
  //   (filterEndDateQuery && `,endDate=lt.${filterEndDateQuery}`);
  const filterQuery =
    (filterStatusQuery && `status=iLike.${filterStatusQuery}`) +
    ((filterStartDateQuery || filterEndDateQuery) && validateDateQuery(filterStartDateQuery, filterEndDateQuery));
  const page = parseInt(searchParams.get('page') || '1', 10); // Get the page number from the query parameter
  const limit = 7;
  // console.log('filterquery', filterQuery);

  const fetchOrder = async () => {
    try {
      // const page = String(page);
      // const limit = String(limit);
      const queryString = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: String(searchQuery),
        filter: String(filterQuery),
      }).toString();
      // console.log('query string', queryString);
      const response = await fetch(`https://mail.apisansco.my.id/api/v1/orders/?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      // console.log('Data fetched:', data);
      return data;
    } catch (error) {
      console.log('Error:', error);
    }
  };

  return await fetchOrder();
}

export default function KasirOrder() {
  const order = useLoaderData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // const handlePaginationClick = (page: number) => {
  //   // Redirect to the same page with the new page number as a query parameter
  //   const queryString = new URLSearchParams({
  //     search: searchQuery,
  //     status: statusFilter,
  //     startDate: startDate ? formatDate(startDate) : '',
  //     endDate: endDate ? formatDate(endDate) : '',
  //     page: String(page), // New page number
  //   }).toString();
  //   window.location.href = `/kasir/?${queryString}`;
  // };

  const formatDate = (date: Date | null) => {
    if (date) {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString().split('T')[0]; // Format as "YYYY-MM-dd"
    }
    return '';
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const queryString = new URLSearchParams({
      page: '1', // Reset page to 1 on search
      search: searchQuery,
      status: statusFilter,
      startDate: startDate ? formatDate(startDate) : '',
      endDate: endDate ? formatDate(endDate) : '',
    }).toString();

    // Redirect to the URL with the new queryString
    window.location.href = `/kasir/?${queryString}`;
  };

  const handlePaginationClick = (page: number) => {
    // Parse the existing query string from the URL
    const currentSearchParams = new URLSearchParams(window.location.search);

    // Update the 'page' parameter in the existing query string
    currentSearchParams.set('page', String(page));

    // Get the updated query string
    const updatedQueryString = currentSearchParams.toString();

    // Redirect to the URL with the updated query string
    window.location.href = `/kasir/?${updatedQueryString}`;
  };

  const calculateTotalBayarSum = (data: any) => {
    let sum = 0;
    for (const item of data) {
      sum += parseInt(item.payment_amount);
    }
    return sum;
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Set the title in the first cell of the first row
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Data Pesanan - ' + new Date().toISOString().split('T')[0];
    titleCell.font = { bold: true, size: 20 };
    titleCell.alignment = { horizontal: 'center' };
    worksheet.mergeCells('A1:E1'); // Merge cells for the title row

    // Add headers to the worksheet
    const headerRow = worksheet.addRow(['No. Pesanan', 'Nama Pemesan', 'Tanggal Pesanan', 'Status Pesanan', 'Total Bayar']);

    // Style the header row
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EEEEEE' } }; // Light Gray background color
      cell.font = { bold: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; // Thin border around cells
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Add data to the worksheet
    // let arr: any = order.forExportData.filter(
    //   (data: any) => data.status !== 'Pesanan Dibatalkan' && data.status !== 'Menunggu Pelanggan Untuk Memesan'
    // );

    order.forExportData.forEach((data: any, index: number) => {
      const row = worksheet.addRow([
        index + 1,
        data.name,
        new Date(data.createdAt).toISOString().split('T')[0],
        data.status,
        data.payment_amount ? Number(data.payment_amount) : Number(0),
      ]);
      // Style the data rows
      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; // Thin border around cells
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    let arr: any = [];
    order.forExportData.forEach((data: any) => {
      data.payment_amount = data.payment_amount ? Number(data.payment_amount) : Number(0);
      arr.push(data);
    });

    // Add the "Total :" row
    const sum = calculateTotalBayarSum(arr);
    const totalRow = worksheet.addRow(['Total :', '', '', '', sum]);

    // Style the "Total :" row
    totalRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC0' } }; // Yellow background color
      cell.font = { bold: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'double' }, right: { style: 'thin' } }; // Thick bottom border for total row
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Merge cells for the "Total :" row
    worksheet.mergeCells(`A${totalRow.number}:D${totalRow.number}`);

    // Auto-fit column widths
    worksheet.columns.forEach((column) => {
      column.width = column.width ?? 15;
    });

    // Style the "Status Pesanan" column to wrap text
    const statusColumn = worksheet.getColumn('D');
    statusColumn.width = 20; // Set the initial width to accommodate some text
    statusColumn.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' };

    // Save the workbook to a file
    const buffer = await workbook.xlsx.writeBuffer();
    const excelData = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(excelData, `Data Pesanan ${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div style={main}>
      <link href='https://cdn.jsdelivr.net/npm/remixicon@3.2.0/fonts/remixicon.css' rel='stylesheet' />
      <div style={helper}>
        <h2 style={heading}>Daftar Pesanan</h2>
      </div>
      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearch}>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...searchInput }}
            placeholder='Search by order code or name'
          />
          <button type='submit' style={searchButton}>
            Search
          </button>
        </form>
        <button onClick={exportToExcel} style={{ ...searchButton, borderRadius: '5px', marginRight: '2rem' }}>
          Export to Excel
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ marginRight: '1rem' }}>Filter Status:</span>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={filterSelect}>
          <option value=''>Select Status</option>
          <option value='Pesanan Dibatalkan'>Pesanan Dibatalkan</option>
          <option value='Order Closed'>Pesanan Selesai</option>
          {/* Add more status options as needed */}
        </select>
        <span style={{ margin: '0 1rem' }}>Start Date:</span>
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat='yyyy-MM-dd' />
        <span style={{ margin: '0 1rem' }}>End Date:</span>
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat='yyyy-MM-dd' />
      </div>
      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Kode Pesanan</th>
              <th style={th}>Nomor Meja</th>
              <th style={th}>Total Bayar</th>
              <th style={th}>Nama</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {order.data.rows.map((data: any) => (
              <tr key={data.id}>
                <td style={td}>{data.order_code}</td>
                <td style={td}>{data.table_number}</td>
                <td style={td}>{data.payment_amount ? data.payment_amount : 'Belum Melakukan Pemesanan'}</td>
                <td style={td}>{data.name}</td>
                <td style={td}>
                  <a style={buttonDetail} href={`/kasir/details/${data.order_code}`}>
                    Detail
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* <span style={span}>Breakpoints on 900px and 400px</span> */}
      <div style={paginationContainer}>
        <div style={pagination}>
          <span
            style={{
              ...paginationItem,
              cursor: order.current_page == 1 ? 'not-allowed' : 'pointer',
              pointerEvents: order.current_page == 1 ? 'none' : 'auto',
            }}
            onClick={() => handlePaginationClick(Number(order.current_page) - 1)} // Go to the previous page
          >
            <i className='ri-arrow-left-line'></i>
          </span>
          <div style={{ margin: '0 0.5rem' }}>
            Page {order.current_page} of {order.total_pages}
          </div>
          <span
            style={{
              ...paginationItem,
              cursor: order.current_page == order.total_pages ? 'not-allowed' : 'pointer',
              pointerEvents: order.current_page == order.total_pages ? 'none' : 'auto',
            }}
            onClick={() => handlePaginationClick(Number(order.current_page) + 1)} // Go to the next page
          >
            <i className='ri-arrow-right-line'></i>
          </span>
        </div>
      </div>
    </div>
  );
}

const main: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start', // Align items to the top of the container
  flex: 1,
  height: '100vh',
  backgroundColor: '#f5f5f5',
  width: '80vw',
  padding: '2rem 0 0 2rem',
  boxSizing: 'border-box', // Add this line to include padding in width and height
};

const helper: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start', // Align heading to the top left
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#333',
  width: '100%', // Ensure the heading takes full width
};

const heading: React.CSSProperties = {
  marginBottom: '1rem',
  textAlign: 'left',
};

const searchForm: React.CSSProperties = {
  marginBottom: '1rem',
};

const searchInput: React.CSSProperties = {
  padding: '10px',
  fontSize: '1rem',
  borderRadius: '5px 0 0 5px',
  border: '1px solid #ccc',
};

const searchButton: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '1rem',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '0 5px 5px 0',
  cursor: 'pointer',
};

const filterSelect: React.CSSProperties = {
  padding: '10px',
  fontSize: '1rem',
  borderRadius: '5px',
  border: '1px solid #ccc',
};

const tableContainer: React.CSSProperties = {
  width: '100%',
  overflow: 'auto',
  // maxHeight: '82%',
  maxHeight: '60%',
};

const table: React.CSSProperties = {
  width: '100%',
  maxWidth: '97%',
  borderCollapse: 'collapse',
  background: '#fff',
  borderRadius: '5px',
  overflow: 'hidden',
  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
  marginBottom: '1rem',
  fontSize: '0.9rem',
  fontWeight: 400,
  color: '#333',
};

const th: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  borderBottom: '1px solid #ddd',
  padding: '10px',
  textAlign: 'left',
};

const td: React.CSSProperties = {
  borderBottom: '1px solid #ddd',
  padding: '10px',
  textAlign: 'left',
};

const paginationContainer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center', // Center the pagination horizontally
  width: '70vw',
  backgroundColor: '#f5f5f5',
  position: 'absolute',
  bottom: '1rem', // Adjust the distance from the bottom as needed
};

const pagination: React.CSSProperties = {
  listStyle: 'none',
  display: 'flex',
  alignItems: 'center',
  margin: 0,
  padding: 0,
};

const paginationItem: React.CSSProperties = {
  margin: '0 0.5rem',
  cursor: 'pointer',
};

const buttonDetail: React.CSSProperties = {
  backgroundColor: '#4CAF50',
  border: 'none',
  color: 'white',
  padding: '5px 10px',
  textAlign: 'center',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '12px',
  borderRadius: '5px',
};
