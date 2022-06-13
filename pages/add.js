import { useState, useEffect } from 'react';
import Head from 'next/head';
import clientPromise from '../lib/mongodb';
import axios from 'axios';
import '@blueprintjs/core/lib/css/blueprint.css';
import 'react-day-picker/lib/style.css';
import '@blueprintjs/table/lib/css/table.css';
import colors from '../utils/colors';
import Form from '../components/Form';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSession } from 'next-auth/react';

export default function Add({ isConnected }) {
    const [data, setData] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
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
    const renderPage = () => {
        return <Form data={data} />
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
