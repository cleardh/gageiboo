import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import clientPromise from '../lib/mongodb';
import axios from 'axios';
const XLSX = require('xlsx');
import * as Recharts from 'recharts';
import { Intent, Spinner, Navbar, Icon, IconSize, FormGroup, NumericInput, Label, Alignment, Button, Switch, Dialog, HTMLSelect, TextArea, HotkeysProvider, Overlay, Checkbox, RadioGroup, Radio, Classes, Toaster, Position, Toast } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import 'react-day-picker/lib/style.css';
import '@blueprintjs/table/lib/css/table.css';
import colors from '../utils/colors';
import GlobalNavbar from '../components/Navbar';

const green = '#188050';
const dark = '#30404d';
const bright = '#f5f5f5';

export default function Chart({ isConnected }) {
    const [darkMode, setDarkMode] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [data, setData] = useState(null);
    const [rememberExpenseFilters, setRememberExpenseFilters] = useState(null);
    const [rememberIncomeFilters, setRememberIncomeFilters] = useState(null);
    const [displayExpenseFilter, setDisplayExpenseFilter] = useState(false);
    const [displayIncomeFilter, setDisplayIncomeFilter] = useState(false);
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        getDataFromDatabase();
    }, []);
    const xlsxRef = useRef(null);
    const isValidSheet = (sheetName) => {
        const sheetNameToLowerCase = sheetName.toLowerCase();
        if (
            sheetNameToLowerCase.indexOf('jan') >= 0 ||
            sheetNameToLowerCase.indexOf('feb') >= 0 ||
            sheetNameToLowerCase.indexOf('mar') >= 0 ||
            sheetNameToLowerCase.indexOf('apr') >= 0 ||
            sheetNameToLowerCase.indexOf('may') >= 0 ||
            sheetNameToLowerCase.indexOf('jun') >= 0 ||
            sheetNameToLowerCase.indexOf('jul') >= 0 ||
            sheetNameToLowerCase.indexOf('aug') >= 0 ||
            sheetNameToLowerCase.indexOf('sep') >= 0 ||
            sheetNameToLowerCase.indexOf('oct') >= 0 ||
            sheetNameToLowerCase.indexOf('nov') >= 0 ||
            sheetNameToLowerCase.indexOf('dec') >= 0
        ) {
            return true;
        }
        return false;
    }
    const excelDateToJSDate = (excelDate) => {
        const date = new Date(Math.round((excelDate - (25567 + 2)) * 86400 * 1000));
        const converted_date = date.toISOString().split('T')[0];
        return converted_date;
    }
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
    const getDataFromXlsx = (e) => {
        if (e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const data = e.target.result;
                const rawData = [];
                const workbook = XLSX.read(data, {
                    type: 'binary'
                });
                workbook.SheetNames.forEach(sheetName => {
                    if (isValidSheet(sheetName)) {
                        const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        const parsed_row_object = XL_row_object.map(row => ({ ...row, '날짜': excelDateToJSDate(row['날짜']) }));
                        rawData = [...rawData, ...parsed_row_object];
                    }
                });
                rawData.sort((a, b) => new Date(b['날짜']) - new Date(a['날짜']))
                axios.post('/api/transactions', rawData);
                parseData(rawData);
            };
            reader.readAsBinaryString(e.target.files[0]);
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
    const filterData = (rawData) => {
        const { expenseData, incomeData, expenseMonths, incomeMonths, expenseCategories, incomeCategories } = rawData;
        const expenseMonthsToFilter = expenseMonths.map(monthObj => monthObj.value && monthObj.key).filter(month => month);
        const incomeMonthsToFilter = incomeMonths.map(monthObj => monthObj.value && monthObj.key).filter(month => month);
        const expenseCategoriesToFilter = expenseCategories.map(catObj => catObj.value && catObj.key).filter(category => category);
        const incomeCategoriesToFilter = incomeCategories.map(catObj => catObj.value && catObj.key).filter(category => category);
        const expense = expenseData.filter(row => expenseMonthsToFilter.indexOf(row.month) >= 0).map(row => {
            Object.keys(row).forEach(element => {
                if (element !== 'month') {
                    if (expenseCategoriesToFilter.indexOf(element) < 0) {
                        return;
                    }
                }
            });
            return row;
        });
        const income = incomeData.filter(row => incomeMonthsToFilter.indexOf(row.month) >= 0).map(row => {
            Object.keys(row).forEach(element => {
                if (element !== 'month') {
                    if (incomeCategoriesToFilter.indexOf(element) < 0) {
                        return;
                    }
                }
            });
            return row;
        });
        return { expense, income, expenseMonthsToFilter, incomeMonthsToFilter, expenseCategoriesToFilter, incomeCategoriesToFilter };
    }
    const openFilters = (type) => {
        if (type === 'expense') {
            setRememberExpenseFilters({
                expenseMonths: data.expenseMonths,
                expenseCategories: data.expenseCategories
            });
            setDisplayExpenseFilter(true);
        }
        if (type === 'income') {
            setRememberIncomeFilters({
                incomeMonths: data.incomeMonths,
                incomeCategories: data.incomeCategories
            });
            setDisplayIncomeFilter(true);
        }
    }
    const updateFilter = (type, month, category) => {
        if (type === 'expense') {
            if (category) {
                setData({
                    ...data,
                    expenseCategories: data.expenseCategories.map(catObj => catObj.key === category ? ({ ...catObj, value: !catObj.value }) : catObj)
                });
            }
            if (month) {
                setData({
                    ...data,
                    expenseMonths: data.expenseMonths.map(monthObj => monthObj.key === month ? ({ ...monthObj, value: !monthObj.value }) : monthObj)
                });
            }
        }
        if (type === 'income') {
            if (category) {
                setData({
                    ...data,
                    incomeCategories: data.incomeCategories.map(catObj => catObj.key === category ? ({ ...catObj, value: !catObj.value }) : catObj)
                });
            }
            if (month) {
                setData({
                    ...data,
                    incomeMonths: data.incomeMonths.map(monthObj => monthObj.key === month ? ({ ...monthObj, value: !monthObj.value }) : monthObj)
                });
            }
        }
    };
    const selectAll = (type, filterType) => {
        if (type === 'expense') {
            if (filterType === 'months') {
                setData({
                    ...data,
                    expenseMonths: data.expenseMonths.map(monthObj => ({ ...monthObj, value: true }))
                });
            }
            if (filterType === 'categories') {
                setData({
                    ...data,
                    expenseCategories: data.expenseCategories.map(catObj => ({ ...catObj, value: true }))
                });
            }
        }
        if (type === 'income') {
            if (filterType === 'months') {
                setData({
                    ...data,
                    incomeMonths: data.incomeMonths.map(monthObj => ({ ...monthObj, value: true }))
                });
            }
            if (filterType === 'categories') {
                setData({
                    ...data,
                    incomeCategories: data.incomeCategories.map(catObj => ({ ...catObj, value: true }))
                });
            }
        }
    }
    const deSelectAll = (type, filterType) => {
        if (type === 'expense') {
            if (filterType === 'months') {
                setData({
                    ...data,
                    expenseMonths: data.expenseMonths.map(monthObj => ({ ...monthObj, value: false }))
                });
            }
            if (filterType === 'categories') {
                setData({
                    ...data,
                    expenseCategories: data.expenseCategories.map(catObj => ({ ...catObj, value: false }))
                });
            }
        }
        if (type === 'income') {
            if (filterType === 'months') {
                setData({
                    ...data,
                    incomeMonths: data.incomeMonths.map(monthObj => ({ ...monthObj, value: false }))
                });
            }
            if (filterType === 'categories') {
                setData({
                    ...data,
                    incomeCategories: data.incomeCategories.map(catObj => ({ ...catObj, value: false }))
                });
            }
        }
    }
    const cancelFilters = (type) => {
        if (type === 'expense') {
            setData({
                ...data,
                expenseMonths: rememberExpenseFilters.expenseMonths,
                expenseCategories: rememberExpenseFilters.expenseCategories
            });
            setDisplayExpenseFilter(false);
        }
        if (type === 'income') {
            setData({
                ...data,
                incomeMonths: rememberIncomeFilters.incomeMonths,
                incomeCategories: rememberIncomeFilters.incomeCategories
            });
            setDisplayIncomeFilter(false);
        }
    }
    const CustomBarShape = (props) => {
        const { fill, x, y, width, height } = props;
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    stroke='none'
                    fill={fill}
                />
                {x > 80 && (
                    <rect
                        x={x}
                        y={y}
                        width={5}
                        height={height}
                        stroke='none'
                        fill={darkMode ? dark : bright}
                    />
                )}
            </g>
        );
    }
    const getTotal = (type, parsedData, label) => {
        let total = 0;
        const categories = type === 'expense' ? data.expenseCategories : data.incomeCategories;
        const monthObj = parsedData.find(row => row.month === label);
        if (!monthObj) return;
        Object.keys(monthObj).forEach(element => {
            if (element === 'month' || !categories.find(catObj => catObj.key === element).value) return;
            total += monthObj[element];
        });
        return total.toFixed(2);
    }
    const renderPage = () => {
        if (!data || ((!data.expenseData || !data.expenseData.length) && (!data.incomeData || !data.incomeData.length))) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Icon icon='ban-circle' size={20} style={{ marginBottom: 20 }}></Icon>
                    No Data Found
                </div>
            );
        }
        // Filters
        const { expense, income, expenseMonthsToFilter, incomeMonthsToFilter, expenseCategoriesToFilter, incomeCategoriesToFilter } = filterData(data);
        const stroke = darkMode ? bright : dark;
        const width = window.innerWidth * 0.8;
        const expenseHeight = (50 * expense.length) + 100;
        const incomeHeight = (50 * income.length) + 100;
        return (
            <div className='chart-container' style={{ height: `${expenseHeight + incomeHeight + 400}px` }}>
                <div className='back-to-top' onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <Icon icon='double-chevron-up' size={20}></Icon>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Label style={{ fontSize: 30, textAlign: 'center', letterSpacing: 5, margin: 0 }}>지출</Label>
                    <Icon className='icon-filter' icon='filter' size={20} style={{ cursor: 'pointer', marginLeft: 10 }} onClick={() => openFilters('expense')}></Icon>
                </div>
                <Overlay className='overlay' isOpen={displayExpenseFilter}>
                    <div className='overlay'>
                        <span style={{ fontSize: 25 }}>지출</span>
                        <div style={{ width: '80%', height: '60%', marginTop: 40, display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ width: '45%', height: '100%' }}>
                                {/* months go here */}
                                <div style={{ display: 'flex', marginBottom: 10 }}>
                                    <Button text='Select all' onClick={() => selectAll('expense', 'months')} />
                                    <Button text='Deselect all' style={{ marginLeft: 10 }} onClick={() => deSelectAll('expense', 'months')} />
                                </div>
                                <div style={{ height: '85%', overflowY: 'scroll', padding: 5 }}>
                                    {data.expenseMonths.map((row, i) => (
                                        <Checkbox key={i} checked={row.value} label={row.key}
                                            onChange={() => updateFilter('expense', row.key, null)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ width: '45%', height: '100%' }}>
                                {/* categories go here */}
                                <div style={{ display: 'flex', marginBottom: 10 }}>
                                    <Button text='Select all' onClick={() => selectAll('expense', 'categories')} />
                                    <Button text='Deselect all' style={{ marginLeft: 10 }} onClick={() => deSelectAll('expense', 'categories')} />
                                </div>
                                <div style={{ height: '85%', overflowY: 'scroll', padding: 5 }}>
                                    {data.expenseCategories.map((row, i) => (
                                        <Checkbox key={i} checked={row.value} label={row.key}
                                            onChange={() => updateFilter('expense', null, row.key)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '40%', marginTop: 40 }}>
                            <Button icon='saved' text='Okay' type='button' intent={Intent.SUCCESS} onClick={() => setDisplayExpenseFilter(false)} />
                            <Button icon='cross' text='Cancel' type='button' intent={Intent.DANGER} onClick={() => cancelFilters('expense')} />
                        </div>
                    </div>
                </Overlay>
                <Recharts.BarChart
                    width={width}
                    height={expenseHeight}
                    layout='vertical'
                    data={expense}
                    margin={{
                        top: 20, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <Recharts.XAxis type='number' stroke={stroke} tickFormatter={(value, index) => `$${value}`} />
                    {expense && expense.length && <Recharts.YAxis dataKey='month' type='category' axisLine={false} fontSize='12' stroke={stroke} tickFormatter={(value, index) => `${value.split('-')[0]}/${value.split('-')[1]}`} />}
                    <Recharts.Tooltip formatter={(value, name, props) => `$${value.toFixed(2)}`} labelFormatter={(label) => (
                        <>
                            <span style={{ fontWeight: 'bold', display: 'block' }}>{label.split('-')[0]}/{label.split('-')[1]}</span>
                            <span style={{ fontWeight: 'bold', display: 'block', margin: '10px 0' }}>Total: ${getTotal('expense', expense, label)}</span>
                        </>
                    )} labelStyle={{ color: bright }} contentStyle={{ background: dark, borderRadius: 10, borderColor: bright }} wrapperStyle={{ zIndex: 1000 }} />
                    <Recharts.Legend iconType='circle' />
                    {expenseCategoriesToFilter.map((category, i) => {
                        return <Recharts.Bar key={i} dataKey={category} layout='vertical' stackId='a' fill={data.expenseCategories.find(catObj => catObj.key === category).color} barSize={40} shape={CustomBarShape} />
                    })}
                </Recharts.BarChart>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                    <Label style={{ fontSize: 30, textAlign: 'center', letterSpacing: 5, margin: 0 }}>수입</Label>
                    <Icon className='icon-filter' icon='filter' size={20} style={{ cursor: 'pointer', marginLeft: 10 }} onClick={() => openFilters('income')}></Icon>
                </div>
                <Overlay className='overlay' isOpen={displayIncomeFilter}>
                    <div className='overlay'>
                        <span style={{ fontSize: 25 }}>수입</span>
                        <div style={{ width: '80%', height: '60%', marginTop: 40, display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ width: '45%', height: '100%' }}>
                                {/* months go here */}
                                <div style={{ display: 'flex', marginBottom: 10 }}>
                                    <Button text='Select all' onClick={() => selectAll('income', 'months')} />
                                    <Button text='Deselect all' style={{ marginLeft: 10 }} onClick={() => deSelectAll('income', 'months')} />
                                </div>
                                <div style={{ height: '85%', overflowY: 'scroll', padding: 5 }}>
                                    {data.incomeMonths.map((row, i) => (
                                        <Checkbox key={i} checked={row.value} label={row.key}
                                            onChange={() => updateFilter('income', row.key, null)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ width: '45%', height: '100%' }}>
                                {/* categories go here */}
                                <div style={{ display: 'flex', marginBottom: 10 }}>
                                    <Button text='Select all' onClick={() => selectAll('income', 'categories')} />
                                    <Button text='Deselect all' style={{ marginLeft: 10 }} onClick={() => deSelectAll('income', 'categories')} />
                                </div>
                                <div style={{ height: '85%', overflowY: 'scroll', padding: 5 }}>
                                    {data.incomeCategories.map((row, i) => (
                                        <Checkbox key={i} checked={row.value} label={row.key}
                                            onChange={() => updateFilter('income', null, row.key)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '40%', marginTop: 40 }}>
                            <Button icon='saved' text='Okay' type='button' intent={Intent.SUCCESS} onClick={() => setDisplayIncomeFilter(false)} />
                            <Button icon='cross' text='Cancel' type='button' intent={Intent.DANGER} onClick={() => cancelFilters('income')} />
                        </div>
                    </div>
                </Overlay>
                <Recharts.BarChart
                    width={width}
                    height={incomeHeight}
                    layout='vertical'
                    data={income}
                    margin={{
                        top: 20, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <Recharts.XAxis type='number' stroke={stroke} tickFormatter={(value, index) => `$${value}`} />
                    {income && income.length && <Recharts.YAxis dataKey='month' type='category' axisLine={false} fontSize='12' stroke={stroke} tickFormatter={(value, index) => `${value.split('-')[0]}/${value.split('-')[1]}`} />}
                    <Recharts.Tooltip formatter={(value, name, props) => `$${value.toFixed(2)}`} labelFormatter={(label) => (
                        <>
                            <span style={{ fontWeight: 'bold', display: 'block' }}>{label.split('-')[0]}/{label.split('-')[1]}</span>
                            <span style={{ fontWeight: 'bold', display: 'block', margin: '10px 0' }}>Total: ${getTotal('income', income, label)}</span>
                        </>
                    )} labelStyle={{ color: bright }} contentStyle={{ background: dark, borderRadius: 10, borderColor: bright, zIndex: 1000 }} wrapperStyle={{ zIndex: 1000 }} />
                    <Recharts.Legend iconType='circle' />
                    {incomeCategoriesToFilter.map((category, i) => (
                        <Recharts.Bar key={i} dataKey={category} layout='vertical' stackId='a' fill={data.incomeCategories.find(catObj => catObj.key === category).color} barSize={40} shape={CustomBarShape} />
                    ))}
                </Recharts.BarChart>
            </div>
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
