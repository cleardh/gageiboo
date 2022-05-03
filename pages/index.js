import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
// import clientPromise from '../lib/mongodb';
// import axios from 'axios';
const XLSX = require('xlsx');
import * as Recharts from 'recharts';
import { Intent, Spinner, Navbar, Icon, IconSize, FormGroup, NumericInput, Label, Alignment, Button, Switch, Dialog, HTMLSelect, TextArea, HotkeysProvider } from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import { Table2, EditableCell2, Column, Cell } from '@blueprintjs/table';
import '@blueprintjs/core/lib/css/blueprint.css';
import 'react-day-picker/lib/style.css';
import '@blueprintjs/table/lib/css/table.css';

const green = '#188050';
const dark = '#30404d';
const bright = '#f5f5f5';
export default function Home() {
  const [page, setPage] = useState('/chart');
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState({
    amount: '',
    date: (new Date()).toLocaleDateString(),
    type: 'credit',
    location: '',
    category: '',
    memo: ''
  });
  const [transactions, setTransactions] = useState(null);
  const [data, setData] = useState(null);
  const xlsxRef = useRef(null);
  const updateFormData = (key, value) => {
    setFormData({
      ...formData,
      [key]: value
    });
  }
  const setType = (e) => {
    const toggle = e.target.checked;
    setFormData({
      ...formData,
      type: toggle ? 'debit' : 'credit'
    });
  }
  useEffect(() => {
    if (document.getElementById('amountInput')) document.getElementById('amountInput').focus();
  }, [page]);
  // useEffect(() => fetchData(), [page]);
  // const fetchData = async () => {
  //   axios.get('/api/transactions')
  //     .then(res => setTransactions(res.data))
  //     .catch(err => console.log(err));
  // }
  const postData = async () => {
    // axios.post('/api/transactions', formData)
    //   .then(() => setFormData({
    //     amount: null,
    //     date: (new Date()).toLocaleDateString(),
    //     type: 'credit',
    //     location: '',
    //     category: '',
    //     memo: ''
    //   })).catch(err => console.log(err));
    setFormData({
      amount: '',
      date: (new Date()).toLocaleDateString(),
      type: 'credit',
      location: '',
      category: '',
      memo: ''
    })
  }
  const excelDateToJSDate = (excelDate) => {
    var date = new Date(Math.round((excelDate - (25567 + 2)) * 86400 * 1000));
    var converted_date = date.toISOString().split('T')[0];
    return converted_date;
  }
  const getDataFromXlsx = (e) => {
    if (e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, {
          type: 'binary'
        });
        const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets['Feb2022']);
        const parsed_row_object = XL_row_object.map(row => ({ ...row, '날짜': excelDateToJSDate(row['날짜']) }));
        // const json_object = JSON.stringify(parsed_row_object);
        setData(parsed_row_object);
      };
      reader.readAsBinaryString(e.target.files[0]);
    }
  }
  const groupBy = (array, key) => {
    return array
      .reduce((hash, obj) => {
        if (obj[key] === undefined) return hash;
        return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
      }, {})
  }
  const renderPage = () => {
    switch (page) {
      case '/':
        return (
          <FormGroup>
            <div className='form-input-group'>
              <Label htmlFor='amount' className='labels'>Amount</Label>
              <NumericInput id='amount' inputRef={ref => { if (ref) ref.id = 'amountInput'; }} leftIcon='dollar' onValueChange={(valueAsNumber, valueAsString) => updateFormData('amount', valueAsString)} value={formData.amount} buttonPosition='none' />
            </div>
            <div className='form-input-group'>
              <Label htmlFor='date' className='labels'>Date</Label>
              <DateInput id='date' onChange={selectedDate => updateFormData('date', selectedDate.toLocaleDateString())} value={new Date(formData.date)} formatDate={date => date.toLocaleDateString()} placeholder='MM/DD/YYYY' parseDate={str => new Date(str)} showActionsBar={true} todayButtonText='Today' />
            </div>
            <div className='form-input-group'>
              <Label htmlFor='type' className='labels'>Type</Label>
              <div className='space-around'>
                <Icon icon='minus' size={IconSize.LARGE} />
                <Switch large checked={formData.type === 'debit'} onChange={setType} />
                <Icon icon='plus' size={IconSize.LARGE} />
              </div>
            </div>
            <div className='form-input-group'>
              <Label htmlFor='location' className='labels'>Location</Label>
              <HTMLSelect onChange={e => updateFormData('location', e.target.value)} value={formData.location}>
                <option value=''></option>
                <option value='sobeys'>Sobeys</option>
                <option value='costco'>Costco</option>
                <option value='walmart'>Walmart</option>
                <option value='canadiantire'>Canadian Tire</option>
              </HTMLSelect>
            </div>
            <div className='form-input-group'>
              <Label htmlFor='category' className='labels'>Category</Label>
              <HTMLSelect onChange={e => updateFormData('category', e.target.value)} value={formData.category}>
                <option value=''></option>
                <option value='food'>Food</option>
                <option value='gas'>Gas</option>
                <option value='toys'>Toys</option>
                <option value='misc'>Miscellaneous</option>
              </HTMLSelect>
            </div>
            <div className='form-input-group'>
              <Label htmlFor='memo' className='labels'>Memo</Label>
              <TextArea
                id='memo'
                growVertically={true}
                intent={Intent.PRIMARY}
                onChange={e => updateFormData('memo', e.target.value)}
                value={formData.memo}
              />
            </div>
            <hr style={{ width: '100%' }} />
            <Button icon='saved' className='btn-submit' text='Submit' type='button' intent={Intent.SUCCESS} onClick={postData} />
          </FormGroup>
        );
      case '/chart':
        const categories = [];
        if (!data || !data.length) {
          return (
            <>
              <input type='file' hidden id='xlsx' ref={xlsxRef} onChange={getDataFromXlsx} />
              <Button icon='plus' type='button' intent={Intent.SUCCESS} onClick={() => xlsxRef.current.click()} />
            </>
          );
        }
        let groupByMonth = [];
        let groupByMonthCategory = [];
        data.forEach(row => {
          const dataRow = groupByMonth.find(d => d.date === row['날짜'].substring(0, 7));
          if (categories.indexOf(row['카테고리']) < 0) categories.push(row['카테고리']);
          if (dataRow) {
            if (!dataRow[row['카테고리']]) return dataRow[row['카테고리']] = parseFloat(row['지출']);
            return dataRow[row['카테고리']] += parseFloat(row['지출']);
          }
          groupByMonth.push({ date: row['날짜'].substring(0, 7), [row['카테고리']]: parseFloat(row['지출']) });
        });
        // data.forEach(row => {
        //   const dataRow = groupByMonth.find(d => d.date === row['날짜']);
        //   if (categories.indexOf(row['카테고리']) < 0) categories.push(row['카테고리']);
        //   if (dataRow) {
        //     if (!dataRow[row['카테고리']]) return dataRow[row['카테고리']] = parseFloat(row['지출']);
        //     return dataRow[row['카테고리']] += parseFloat(row['지출']);
        //   }
        //   groupByMonth.push({ date: row['날짜'], [row['카테고리']]: parseFloat(row['지출']) });
        // });
        groupByMonth.forEach(row => {
          categories.forEach(category => {
            if (!row[category]) {
              row[category] = 0;
            } else {
              row[category] = row[category].toFixed(2);
            }
          });
        });
        const fillColors = ['#fabed4', '#ffd8b1', '#fffac8', '#aaffc3', '#dcbeff', '#a9a9a9', '#4363d8', '#808000'];
        const stroke = darkMode ? bright : dark;
        return (
          <>
            {groupByMonth && groupByMonth.length && (
              <Recharts.BarChart
                width={window.innerWidth * 0.8}
                height={300}
                layout='vertical'
                data={groupByMonth}
                margin={{
                  top: 20, right: 30, left: 20, bottom: 5,
                }}
              >
                {/* <Recharts.CartesianGrid strokeDasharray='3 3' /> */}
                <Recharts.XAxis type='number' stroke={stroke} />
                <Recharts.YAxis dataKey='date' type='category' fontSize='12' stroke={stroke} />
                <Recharts.Tooltip labelStyle={{ color: bright }} contentStyle={{ background: dark, borderRadius: 10, borderColor: bright }} />
                <Recharts.Legend />
                {categories.map((category, i) => (
                  <Recharts.Bar key={i} dataKey={category} layout='vertical' stackId='a' fill={fillColors[i]} />
                ))}
              </Recharts.BarChart>
              // <Recharts.BarChart width={800} height={400} data={groupByMonth}>
              //   <Recharts.CartesianGrid strokeDasharray="3 3" />
              //   <Recharts.XAxis dataKey='date' tick={{ fontSize: 0 }} interval={1} tickFormatter={(unixTime) => new Date(unixTime).toString().split(' ')[1] + new Date(unixTime).toString().split(' ')[2]} />
              //   <Recharts.YAxis tick={{ fontSize: 20 }} />
              //   <Recharts.Tooltip labelStyle={{ fontSize: 20 }} contentStyle={{ fontSize: 20 }} formatter={(value, name, props) => `$${value.toFixed(2)}`} />
              //   <Recharts.Bar dataKey='amount' fill="#8884d8" />
              // </Recharts.BarChart>
            )}
          </>
        );
      default:
        break;
    }
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
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: ${darkMode ? dark : bright};
          color: ${darkMode ? bright : dark};
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
      `}</style>
  )
  return (
    <div className='container'>
      <Head>
        <title>Gageiboo</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <Navbar fixedToTop className='navbar'>
          <Navbar.Group align={Alignment.RIGHT}>
            <Icon icon='insert' size={IconSize.LARGE} onClick={() => setPage('/')} className='navbar-elements' />
            <Icon icon='chart' size={IconSize.LARGE} onClick={() => setPage('/chart')} className='navbar-elements' />
            <Icon icon='th' size={IconSize.LARGE} onClick={() => setPage('/raw')} className='navbar-elements' />
            <Icon icon='contrast' size={IconSize.LARGE} onClick={() => setDarkMode(!darkMode)} className='navbar-elements' />
          </Navbar.Group>
        </Navbar>
        {renderPage()}
        {/* <Spinner intent={Intent.WARNING} size={75} /> */}
      </main>
      {globalStyle}
    </div>
  )
}

// export async function getServerSideProps(context) {
//   try {
//     // client.db() will be the default database passed in the MONGODB_URI
//     // You can change the database by calling the client.db() function and specifying a database like:
//     // const db = client.db('myDatabase');
//     // Then you can execute queries against your database like so:
//     // db.find({}) or any of the MongoDB Node Driver commands
//     await clientPromise;
//     return {
//       props: {
//         isConnected: true
//       },
//     }
//   } catch (e) {
//     console.error(e)
//     return {
//       props: { isConnected: false },
//     }
//   }
// }
