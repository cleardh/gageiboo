import { useState } from 'react'
import { Router, useRouter } from 'next/router'
import Head from 'next/head'
import clientPromise from '../lib/mongodb'
import '@blueprintjs/core/lib/css/blueprint.css';
import { Intent, Spinner, Icon, IconSize, FormGroup, InputGroup, Classes } from '@blueprintjs/core'

export default function Home({ isConnected }) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [amount, setAmount] = useState('');
  const inputAmount = e => {
    let lastDigit = e.target.value[e.target.value.length - 1];
    if (typeof lastDigit === 'undefined') return setAmount('$0.00');
    console.log((e.target.value.match(/\./g) || []).length);
    if (
      isNaN(lastDigit) && lastDigit !== 'Backspace' && lastDigit !== 'Enter' && lastDigit !== '.' ||
      ((e.target.value.match(/\./g) || []).length > 1 && lastDigit === '.') ||
      ((e.target.value.match(/\./g) || []).length > 0 && e.target.value.split('.')[1].length > 2)
    ) return;
    let amt = e.target.value;
    // Need to format trailing zeroes depending on decimal points
    setAmount(amt);
  }
  return (
    <div className='container'>
      <Head>
        <title>Gageiboo</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        {isConnected ? (
          <>
            <div className='navbar'>
              <Icon icon='application' size={IconSize.LARGE} onClick={() => router.push('/chart')} className='navbar-elements' />
              <Icon icon='grouped-bar-chart' size={IconSize.LARGE} onClick={() => router.push('/chart')} className='navbar-elements' />
              <Icon icon='contrast' size={IconSize.LARGE} onClick={() => setDarkMode(!darkMode)} className='navbar-elements' />
            </div>
            <div>
              <FormGroup
                helperText='Helper text with details...'
                label='Label A'
                labelFor='text-input'
                labelInfo='(required)'
              >
                <input className={`${Classes.INPUT} form-input`} type='text' placeholder='$ Amount' onChange={inputAmount} value={amount} />
                {/* <InputGroup className='form-input' type='text' placeholder='Placeholder text' onChange={inputAmount} value={amount} />
                <InputGroup className='form-input' type='text' placeholder='Placeholder text' onChange={inputAmount} value={amount} />
                <InputGroup className='form-input' type='text' placeholder='Placeholder text' onChange={inputAmount} value={amount} />
                <InputGroup className='form-input' type='text' placeholder='Placeholder text' onChange={inputAmount} value={amount} />
                <InputGroup className='form-input' type='text' placeholder='Placeholder text' onChange={inputAmount} value={amount} /> */}
              </FormGroup>
            </div>
          </>
        ) : (
          <Spinner intent={Intent.WARNING} size={75} />
        )}
      </main>

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
          background: ${darkMode ? '#30404d' : '#f5f5f5'};
          color: ${darkMode ? '#f5f5f5' : '#30404d'};
        }
        .navbar {
          width: 100%;
          height: 40px;
          position: fixed;
          left: 0;
          top: 0;
          background: #188050;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding-right: 100px;
          color: #f5f5f5;
        }
        .navbar-elements {
          cursor: pointer;
          margin: 0 15px;
          ${!darkMode && 'filter: invert(1);'}
        }
        .form-input {
          margin: 10px 0;
        }
      `}</style>
    </div>
  )
}

export async function getServerSideProps(context) {
  try {
    // client.db() will be the default database passed in the MONGODB_URI
    // You can change the database by calling the client.db() function and specifying a database like:
    // const db = client.db('myDatabase');
    // Then you can execute queries against your database like so:
    // db.find({}) or any of the MongoDB Node Driver commands
    const client = await clientPromise
    // const db = client.db('gageiboo')
    // const transactions = await db.collection('transactions').find({}).toArray()
    // console.log(transactions[0].amount)
    return {
      props: { isConnected: true },
    }
  } catch (e) {
    console.error(e)
    return {
      props: { isConnected: false },
    }
  }
}
