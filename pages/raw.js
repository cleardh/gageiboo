import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import clientPromise from '../lib/mongodb';
import axios from 'axios';
import { Intent, Spinner, Navbar, Icon, IconSize, FormGroup, NumericInput, Label, Alignment, Button, Switch, Dialog, HTMLSelect, TextArea, HotkeysProvider, Overlay, Checkbox, RadioGroup, Radio, Classes, Toaster, Position, Toast } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import 'react-day-picker/lib/style.css';
import '@blueprintjs/table/lib/css/table.css';
import colors from '../utils/colors';
import { Cell, Column, Table2 } from '@blueprintjs/table';
import GlobalNavbar from '../components/Navbar';
import Form from '../components/Form';

const green = '#188050';
const dark = '#30404d';
const bright = '#f5f5f5';

export default function Raw({ isConnected }) {
    const [darkMode, setDarkMode] = useState(true);
    const [data, setData] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [updateRowIndex, setUpdateRowIndex] = useState(-1);
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        getDataFromDatabase();
    }, []);
    const getDataFromDatabase = async () => {
        try {
            setLoadingData(true);
            const transactions = await axios.get('/api/transactions');
            setLoadingData(false);
            transactions.data.sort((a, b) => new Date(b['날짜']) - new Date(a['날짜']));
            parseData(transactions.data);
        } catch (err) {
            console.log(err);
        }
    }
    const parseData = (rawData) => {
        const expenseData = [];
        const expenseCategories = [];
        const incomeData = [];
        const incomeCategories = [];
        let eIndex = 0;
        let iIndex = 0;
        rawData.forEach(async row => {
            try {
                if (row['수입']) {
                    const dataRow = incomeData.find(d => d.month === row['날짜'].substring(0, 7));
                    if (!incomeCategories.find(catObj => catObj.key === row['카테고리'])) incomeCategories.push({ key: row['카테고리'], value: true, color: colors[iIndex++] });
                    if (dataRow) {
                        if (!dataRow[row['카테고리']]) return dataRow[row['카테고리']] = parseFloat(row['수입']);
                        return dataRow[row['카테고리']] += parseFloat(row['수입']);
                    }
                    incomeData.push({ month: row['날짜'].substring(0, 7), [row['카테고리']]: parseFloat(row['수입']) });
                    return;
                }
                const dataRow = expenseData.find(d => d.month === row['날짜'].substring(0, 7));
                if (!expenseCategories.find(catObj => catObj.key === row['카테고리'])) expenseCategories.push({ key: row['카테고리'], value: true, color: colors[eIndex++] });
                if (dataRow) {
                    if (!dataRow[row['카테고리']]) return dataRow[row['카테고리']] = parseFloat(row['지출']);
                    return dataRow[row['카테고리']] += parseFloat(row['지출']);
                }
                expenseData.push({ month: row['날짜'].substring(0, 7), [row['카테고리']]: parseFloat(row['지출']) });
            } catch (err) {
                console.log(err);
            }
        });
        const expenseMonths = expenseData.map(row => ({ key: row.month, value: true }));
        const incomeMonths = incomeData.map(row => ({ key: row.month, value: true }));

        setData({
            expenseData,
            incomeData,
            expenseMonths,
            incomeMonths,
            expenseCategories,
            incomeCategories,
            raw: rawData
        });
    }
    const exitFromUpdateModal = (updated) => {
        if (updated) getDataFromDatabase();
        setUpdateRowIndex(-1);
    }
    const renderPage = () => {
        if (!data || !data.raw || !data.raw.length) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Icon icon='ban-circle' size={20} style={{ marginBottom: 20 }}></Icon>
                    No Data Found
                </div>
            );
        }
        return (
            <div className='spreadsheet'>
                <Table2 numRows={data.raw.length}>
                    <Column name='날짜' cellRenderer={(rowIndex) => (<Cell>{data.raw[rowIndex].날짜}</Cell>)} />
                    <Column name='카테고리' cellRenderer={(rowIndex) => (<Cell>{data.raw[rowIndex].카테고리}</Cell>)} />
                    <Column name='지출' cellRenderer={(rowIndex) => (<Cell>{data.raw[rowIndex].지출 ? (data.raw[rowIndex].지출).toFixed(2) : null}</Cell>)} />
                    <Column name='수입' cellRenderer={(rowIndex) => (<Cell>{data.raw[rowIndex].수입 ? (data.raw[rowIndex].수입).toFixed(2) : null}</Cell>)} />
                    <Column name='메모' cellRenderer={(rowIndex) => (<Cell>{data.raw[rowIndex].메모}</Cell>)} />
                    <Column name='' cellRenderer={(rowIndex) => (<Cell className='button-cell'>
                        <Button className='button-update' icon='edit' text='Edit' type='button' intent={Intent.PRIMARY} onClick={() => setUpdateRowIndex(rowIndex)} small={true} />
                    </Cell>)} />
                </Table2>
                <Overlay className='overlay' isOpen={updateRowIndex >= 0}>
                    <div className='overlay'>
                        <Form data={data} updateData={data.raw[updateRowIndex]} exit={(updated) => exitFromUpdateModal(updated)} />
                    </div>
                </Overlay>
            </div >
        );
    }
    const globalStyle = (
        <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
        .container, .chart-container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: ${darkMode ? dark : bright};
          color: ${darkMode ? bright : dark};
        }
        .chart-container {
          justify-content: flex-start;
          padding-top: 120px;
        }
        .navbar {
          width: 100%;
          height: 40px;
          position: fixed;
          left: 0;
          top: 0;
          background: ${green};
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding-right: 100px;
          color: ${bright};
        }
        .navbar-elements {
          cursor: pointer;
          margin: 0 15px;
          ${!darkMode ? 'filter: invert(1);' : ''}
        }
        .navbar-elements:hover {
          filter: opacity(0.5);
        }
        .navbar-tooltip {
          top: 50px;
        }
        .dialog-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 30px 30px 0;
        }
        .form-input-group {
          margin: 10px 0;
        }
        .bp3-input {
          width: 200px !important;
          text-align: right;
        }
        .labels {
          font-weight: 600;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select:none;
          user-select:none;
          -o-user-select:none; 
        }
        .btn-submit, .bp3-html-select {
          width: 200px;
          height: 40px;
        }
        .btn-submit {
          margin-top: 10px;
        }
        .space-around {
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
        #memo {
          text-align: left;
        }
        .icon-filter:hover {
          animation: shake 0.92s;
        }
        @keyframes shake {
          10%, 90% {
            transform: translate3d(-1px, 0, 0);
          }
          20%, 80% {
            transform: translate3d(2px, 0, 0);
          }
          30%, 50%, 70% {
            transform: translate3d(-4px, 0, 0);
          }
          40%, 60% {
            transform: translate3d(4px, 0, 0);
          }
        }
        .overlay {
          width: 50%;
          height: 50%;
          position: fixed;
          left: 25%;
          top: 25%;
          color: #f5f5f5;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .back-to-top {
          position: sticky;
          top: 90%;
          left: 100%;
          border: 1px solid #fff;
          border-radius: 50%;
          padding: 3px;
          cursor: pointer;
          z-index: 1000000;
        }
        .back-to-top:hover {
          filter: opacity(0.5);
        }
        .spreadsheet {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: fill-available;
          display: flex;
          justify-content: center;
          padding: 40px 0 0;
        }
        .button-cell {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .button-update {
          width: 100px;
          transform: scale(0.7);
        }
      `}</style>
    )
    return (
        <div className='container'>
            <Head>
                <title>Gageiboo</title>
                <link rel='icon' href='/favicon.ico' />
            </Head>

            <main>
                {!isConnected || loadingData ? (
                    <Spinner intent={Intent.NONE} size={75} />
                ) : (
                    <>
                        <GlobalNavbar toggleDarkMode={() => setDarkMode(!darkMode)} />
                        {renderPage()}
                    </>
                )}
            </main>
            {globalStyle}
        </div>
    )
}

export async function getServerSideProps(context) {
    try {
        await clientPromise;
        return {
            props: {
                isConnected: true
            },
        }
    } catch (e) {
        console.error(e)
        return {
            props: { isConnected: false },
        }
    }
}
