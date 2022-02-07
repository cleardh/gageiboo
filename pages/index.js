import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import clientPromise from '../lib/mongodb'
import '@blueprintjs/core/lib/css/blueprint.css';
import { Intent, Spinner, Navbar, Icon, IconSize, FormGroup, NumericInput, Label, Alignment, Button, Switch, Dialog, HTMLSelect, Classes } from '@blueprintjs/core'
import { DateInput } from '@blueprintjs/datetime'
import 'react-day-picker/lib/style.css';

const green = '#188050';
const dark = '#30404d';
const bright = '#f5f5f5';
export default function Home({ isConnected }) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState({
    amount: null,
    date: (new Date()).toLocaleDateString(),
    type: 'credit',
    location: '',
    category: ''
  });
  const updateFormData = (key, value) => {
    setFormData({
      ...formData,
      [key]: value
    });
  }
  const [addLocationModal, setAddLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const setType = (e) => {
    const toggle = e.target.checked;
    setFormData({
      ...formData,
      type: toggle ? 'debit' : 'credit'
    });
  }
  useEffect(() => {
    if (formData.location === 'addnew') {
      setAddLocationModal(true);
    }
  }, [formData.location]);
  const onLocationDialogClose = () => {
    setAddLocationModal(false);
    updateFormData('location', '');
  }
  useEffect(() => {
    if (formData.category === 'addnew') {
      setAddCategoryModal(true);
    }
  }, [formData.category]);
  const onCategoryDialogClose = () => {
    setAddCategoryModal(false);
    updateFormData('category', '');
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
            <Navbar fixedToTop className='navbar'>
              <Navbar.Group align={Alignment.RIGHT}>
                <Icon icon='insert' size={IconSize.LARGE} onClick={() => console.log('insert')} className='navbar-elements' />
                <Icon icon='application' size={IconSize.LARGE} onClick={() => console.log('form')} className='navbar-elements' />
                <Icon icon='grouped-bar-chart' size={IconSize.LARGE} onClick={() => router.push('/chart')} className='navbar-elements' />
                <Icon icon='contrast' size={IconSize.LARGE} onClick={() => setDarkMode(!darkMode)} className='navbar-elements' />
              </Navbar.Group>
            </Navbar>
            <FormGroup>
              <Dialog isOpen={addLocationModal} title='Add new location' onClose={onLocationDialogClose}>
                <div className='dialog-content'>
                  <input autoFocus className={Classes.INPUT} style={{ textAlign: 'left', marginBottom: 10 }} value={newLocation} onChange={e => setNewLocation(e.target.value)} />
                  <Button icon='add' className='btn-submit' text='Add' type='button' intent={Intent.SUCCESS} onClick={() => console.log('Adding...')} />
                  <Button icon='delete' className='btn-submit' text='Delete' type='button' intent={Intent.DANGER} onClick={() => console.log('Deleting...')} />
                </div>
              </Dialog>
              <Dialog isOpen={addCategoryModal} title='Add new category' onClose={onCategoryDialogClose}>
                <div className='dialog-content'>
                  <input autoFocus className={Classes.INPUT} style={{ textAlign: 'left', marginBottom: 10 }} value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                  <Button icon='add' className='btn-submit' style={{ marginBottom: 10 }} text='Add' type='button' intent={Intent.SUCCESS} onClick={() => console.log('Adding...')} />
                  <Button icon='delete' className='btn-submit' text='Delete' type='button' intent={Intent.DANGER} onClick={() => console.log('Deleting...')} />
                </div>
              </Dialog>
              <div className='form-input-group'>
                <Label htmlFor='amount' className='labels'>Amount</Label>
                <NumericInput id='amount' inputRef={ref => ref && ref.focus()} leftIcon='dollar' onValueChange={(valueAsNumber, valueAsString) => updateFormData('amount', valueAsString)} buttonPosition='none' />
              </div>
              <div className='form-input-group'>
                <Label htmlFor='date' className='labels'>Date</Label>
                <DateInput id='date' onChange={selectedDate => updateFormData('date', selectedDate.toLocaleDateString())} formatDate={date => date.toLocaleDateString()} placeholder='MM/DD/YYYY' parseDate={str => new Date(str)} showActionsBar={true} todayButtonText='Today' />
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
                  <option value='addnew'>-- Add new --</option>
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
                  <option value='addnew'>-- Add new --</option>
                </HTMLSelect>
              </div>
              <Button icon='saved' className='btn-submit' text='Submit' type='button' intent={Intent.SUCCESS} onClick={() => console.log('Submitting...')} />
            </FormGroup>
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
          ${!darkMode && 'filter: invert(1);'}
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
        .space-around {
          display: flex;
          justify-content: space-around;
          align-items: center;
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
