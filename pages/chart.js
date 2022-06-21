import { useState, useEffect } from 'react';
import Head from 'next/head';
import clientPromise from '../lib/mongodb';
import axios from 'axios';
import * as Recharts from 'recharts';
import { Intent, Icon, Label, Button, Overlay, Checkbox } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import 'react-day-picker/lib/style.css';
import '@blueprintjs/table/lib/css/table.css';
import colors from '../utils/colors';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSession } from 'next-auth/react';
import { Cell, Column, Table2 } from '@blueprintjs/table';

const dark = '#30404d';
const bright = '#f5f5f5';
export default function Chart({ isConnected, darkMode }) {
    const [data, setData] = useState(null);
    const [viewMode, setViewMode] = useState('chart');
    const [loadingData, setLoadingData] = useState(false);
    const [rememberExpenseFilters, setRememberExpenseFilters] = useState(null);
    const [rememberIncomeFilters, setRememberIncomeFilters] = useState(null);
    const [displayExpenseFilter, setDisplayExpenseFilter] = useState(false);
    const [displayIncomeFilter, setDisplayIncomeFilter] = useState(false);
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
    const selectBookmarks = (type) => {
        if (type === 'expense') {
            setData({
                ...data,
                expenseCategories: data.expenseCategories.map(catObj => ({ ...catObj, value: true }))
            });
        }
        if (type === 'income') {
            setData({
                ...data,
                incomeCategories: data.incomeCategories.map(catObj => ({ ...catObj, value: true }))
            });
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
                        width={3}
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
            <div className='chart-container' style={{ height: `${expenseHeight + incomeHeight + 450}px` }}>
                <div className='back-to-top' style={{ display: displayExpenseFilter || displayIncomeFilter ? 'none' : '' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <Icon icon='double-chevron-up' size={20}></Icon>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', padding: 20, position: 'absolute', top: 50 }}>
                    <div className='viewMode-indicator' style={{ borderColor: viewMode === 'chart' ? '#188050' : 'transparent' }}>
                        <Button icon='chart' intent={Intent.NONE} large={true} className='round-button' onClick={() => setViewMode('chart')}></Button>
                    </div>
                    <div className='viewMode-indicator' style={{ borderColor: viewMode === 'chart' ? 'transparent' : '#188050' }}>
                        <Button icon='th' intent={Intent.NONE} large={true} className='round-button' onClick={() => setViewMode('spreadsheet')}></Button>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Label style={{ fontSize: 30, textAlign: 'center', letterSpacing: 5, margin: 0 }}>지출</Label>
                    <Icon className='icon-filter' icon='filter' size={20} style={{ cursor: 'pointer', marginLeft: 10 }} onClick={() => openFilters('expense')}></Icon>
                </div>
                <Overlay isOpen={displayExpenseFilter}>
                    <div className='overlay'>
                        <span style={{ fontSize: 25 }}>지출</span>
                        <div style={{ width: '80%', height: '60%', marginTop: 40, display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ width: '45%', height: '100%' }}>
                                {/* months go here */}
                                <div className='overlay-select-container'>
                                    <Button text='Select all' intent={Intent.PRIMARY} onClick={() => selectAll('expense', 'months')} />
                                    <Button text='Deselect all' intent={Intent.WARNING} className='overlay-select-buttons' onClick={() => deSelectAll('expense', 'months')} />
                                </div>
                                <div className='overlay-checkboxes'>
                                    {data.expenseMonths.map((row, i) => (
                                        <Checkbox key={i} checked={row.value} label={row.key}
                                            onChange={() => updateFilter('expense', row.key, null)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ width: '45%', height: '100%' }}>
                                {/* categories go here */}
                                <div className='overlay-select-container'>
                                    <Button text='Select all' intent={Intent.PRIMARY} onClick={() => selectAll('expense', 'categories')} />
                                    <Button icon='star' intent={Intent.NONE} className='overlay-select-buttons' onClick={() => selectBookmarks('expense')} />
                                    <Button text='Deselect all' intent={Intent.WARNING} className='overlay-select-buttons' onClick={() => deSelectAll('expense', 'categories')} />
                                </div>
                                <div className='overlay-checkboxes'>
                                    {data.expenseCategories.map((row, i) => (
                                        <Checkbox key={i} checked={row.value} label={row.key}
                                            onChange={() => updateFilter('expense', null, row.key)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='overlay-btn-container'>
                            <Button icon='saved' text='Okay' type='button' intent={Intent.SUCCESS} onClick={() => setDisplayExpenseFilter(false)} />
                            <Button icon='cross' text='Cancel' type='button' intent={Intent.DANGER} onClick={() => cancelFilters('expense')} />
                        </div>
                    </div>
                </Overlay>
                {viewMode === 'chart' ? (
                    <Recharts.BarChart
                        id='expenseChart'
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
                ) : (
                    <div id='expenseSpreadsheet' style={{ overflow: 'scroll', width, marginTop: 20 }}>
                        <Table2 numRows={expenseCategoriesToFilter.length + 1} getCellClipboardData={(rowIndex, columnIndex) => {
                            if (columnIndex === 0) return expenseCategoriesToFilter[rowIndex];
                            const monthData = new Array(...expense).sort((a, b) => new Date(a.month) - new Date(b.month))[columnIndex - 1];
                            if (monthData) {
                                return monthData[expenseCategoriesToFilter[rowIndex]] ? monthData[expenseCategoriesToFilter[rowIndex]].toFixed(2) : 0;
                            }
                            return 0;
                        }}
                        >
                            <Column name='카테고리' cellRenderer={(rowIndex) => rowIndex < expenseCategoriesToFilter.length ? (
                                <Cell>{expenseCategoriesToFilter[rowIndex]}</Cell>
                            ) : (
                                <Cell className='total-cell'>Total</Cell>
                            )} />
                            {new Array(...expense).sort((a, b) => new Date(a.month) - new Date(b.month)).map(monthData => (
                                <Column key={monthData.month} name={monthData.month} cellRenderer={(rowIndex) => rowIndex < expenseCategoriesToFilter.length ? (
                                    <Cell>{monthData[expenseCategoriesToFilter[rowIndex]] ? monthData[expenseCategoriesToFilter[rowIndex]].toFixed(2) : null}</Cell>
                                ) : (
                                    <Cell className='total-cell'>{Object.keys(monthData).reduce((total, curr) => {
                                        if (curr === 'month' || data.expenseCategories.find(catObj => catObj.key === curr && !catObj.value)) return total + 0;
                                        return total + monthData[curr];
                                    }, 0).toFixed(2)}</Cell>
                                )} />
                            ))}
                        </Table2>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                    <Label style={{ fontSize: 30, textAlign: 'center', letterSpacing: 5, margin: 0 }}>수입</Label>
                    <Icon className='icon-filter' icon='filter' size={20} style={{ cursor: 'pointer', marginLeft: 10 }} onClick={() => openFilters('income')}></Icon>
                </div>
                <Overlay isOpen={displayIncomeFilter}>
                    <div className='overlay'>
                        <span style={{ fontSize: 25 }}>수입</span>
                        <div style={{ width: '80%', height: '60%', marginTop: 40, display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ width: '45%', height: '100%' }}>
                                {/* months go here */}
                                <div className='overlay-select-container'>
                                    <Button text='Select all' intent={Intent.PRIMARY} onClick={() => selectAll('income', 'months')} />
                                    <Button text='Deselect all' intent={Intent.WARNING} className='overlay-select-buttons' onClick={() => deSelectAll('income', 'months')} />
                                </div>
                                <div className='overlay-checkboxes'>
                                    {data.incomeMonths.map((row, i) => (
                                        <Checkbox key={i} checked={row.value} label={row.key}
                                            onChange={() => updateFilter('income', row.key, null)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ width: '45%', height: '100%' }}>
                                {/* categories go here */}
                                <div className='overlay-select-container'>
                                    <Button text='Select all' intent={Intent.PRIMARY} onClick={() => selectAll('income', 'categories')} />
                                    <Button icon='star' intent={Intent.NONE} className='overlay-select-buttons' onClick={() => selectBookmarks('income')} />
                                    <Button text='Deselect all' intent={Intent.WARNING} className='overlay-select-buttons' onClick={() => deSelectAll('income', 'categories')} />
                                </div>
                                <div className='overlay-checkboxes'>
                                    {data.incomeCategories.map((row, i) => (
                                        <Checkbox key={i} checked={row.value} label={row.key}
                                            onChange={() => updateFilter('income', null, row.key)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='overlay-btn-container'>
                            <Button icon='saved' text='Okay' type='button' intent={Intent.SUCCESS} onClick={() => setDisplayIncomeFilter(false)} />
                            <Button icon='cross' text='Cancel' type='button' intent={Intent.DANGER} onClick={() => cancelFilters('income')} />
                        </div>
                    </div>
                </Overlay>
                {viewMode === 'chart' ? (
                    <Recharts.BarChart
                        id='incomeChart'
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
                    </Recharts.BarChart>) : (
                    <div id='incomeSpreadsheet' style={{ overflow: 'scroll', width, marginTop: 20 }}>
                        <Table2 numRows={incomeCategoriesToFilter.length + 1} getCellClipboardData={(rowIndex, columnIndex) => {
                            if (columnIndex === 0) return incomeCategoriesToFilter[rowIndex];
                            const monthData = new Array(...income).sort((a, b) => new Date(a.month) - new Date(b.month))[columnIndex - 1];
                            if (monthData) {
                                return monthData[incomeCategoriesToFilter[rowIndex]] ? monthData[incomeCategoriesToFilter[rowIndex]].toFixed(2) : 0;
                            }
                            return 0;
                        }}
                        >
                            <Column name='카테고리' cellRenderer={(rowIndex) => rowIndex < incomeCategoriesToFilter.length ? (
                                <Cell>{incomeCategoriesToFilter[rowIndex]}</Cell>
                            ) : (
                                <Cell className='total-cell'>Total</Cell>
                            )} />
                            {new Array(...income).sort((a, b) => new Date(a.month) - new Date(b.month)).map(monthData => (
                                <Column key={monthData.month} name={monthData.month} cellRenderer={(rowIndex) => rowIndex < incomeCategoriesToFilter.length ? (
                                    <Cell>{monthData[incomeCategoriesToFilter[rowIndex]] ? monthData[incomeCategoriesToFilter[rowIndex]].toFixed(2) : null}</Cell>
                                ) : (
                                    <Cell className='total-cell'>{Object.keys(monthData).reduce((total, curr) => {
                                        if (curr === 'month' || data.incomeCategories.find(catObj => catObj.key === curr && !catObj.value)) return total + 0;
                                        return total + monthData[curr];
                                    }, 0).toFixed(2)}</Cell>
                                )} />
                            ))}
                        </Table2>
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className='container'>
            <Head>
                <title>Gageiboo</title>
                <link rel='icon' href='/favicon.ico' />
            </Head>

            <main>
                {!isConnected || loadingData ? (
                    <LoadingSpinner />
                ) : renderPage()}
            </main>
        </div>
    )
}

export async function getServerSideProps(context) {
    let pageProps = {
        props: {
            protected: true,
            isConnected: false,
            user: null
        }
    };
    try {
        await clientPromise;
        pageProps.props.isConnected = true;
    } catch (e) {
        console.error(e);
    }
    try {
        const session = await getSession(context);
        if (session) pageProps.props.user = session.user;
    } catch (e) {
        console.error(e);
    }
    return pageProps;
}