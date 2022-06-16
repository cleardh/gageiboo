import React, { useState, useEffect } from 'react';
import { Button, FormGroup, HTMLSelect, Label, NumericInput, Position, Radio, RadioGroup, TextArea, Toast, Toaster, Classes, Intent } from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';
import axios from 'axios';
import moment from 'moment';

let deleteDataMessageTimeout;
let doubleClick = false;
const Form = ({ data, updateData, exit }) => {
    useEffect(() => {
        doubleClick = false;
        if (updateData) {
            const amount = updateData.지출 || updateData.수입;
            const date = parseDate(updateData.날짜);
            const category = updateData.카테고리;
            const transactionType = updateData.지출 ? '지출' : '수입';
            const memo = updateData.메모;
            return setFormData({
                ...formData,
                amount,
                date,
                category,
                transactionType,
                memo
            });
        }
        resetForm();
    }, []);
    const [formData, setFormData] = useState({
        amount: '',
        date: null,
        category: '',
        transactionType: null,
        memo: '',
        error: [],
        success: false
    });
    const [deleteDataMessage, setDeleteDataMessage] = useState('');
    const keypress = (key) => {
        if (key === 'Enter') postData();
    }
    const resetForm = () => {
        setFormData({
            amount: '',
            date: parseDate(),
            category: '',
            transactionType: null,
            memo: '',
            error: [],
            success: false
        });
    }
    const parseDate = dateStr => {
        const date = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
        return date;
    }
    const errorMessage = (err) => {
        switch (err) {
            case 'amount':
                return '금액을 입력해주세요.';
            case 'transactionType':
                return '지출인지 수입인지 입력해주세요.';
            case 'date':
                return '날짜를 입력해주세요.';
            case 'category':
                return '카테고리를 입력해주세요.';
            default:
                break;
        }
        return null;
    }
    const populateCategories = () => {
        let categories = data.expenseCategories;
        if (formData.transactionType === '수입') {
            categories = data.incomeCategories;
        }
        return categories.map((cat, index) => (
            <option key={index} value={cat.key}>{cat.key}</option>
        ));
    }
    const postData = async () => {
        let error = [];
        if (!formData.amount) {
            error.push('amount');
        }
        if (!formData.transactionType) {
            error.push('transactionType');
        }
        if (!formData.date) {
            error.push('date');
        }
        if (!formData.category) {
            error.push('category');
        }
        setFormData({
            ...formData,
            error
        });
        if (error.length) {
            console.log('Form not ready');
            return;
        }
        const dataToPost = {
            날짜: moment(formData.date).format('YYYY-MM-DD'),
            카테고리: formData.category,
            메모: formData.memo
        };
        if (formData.transactionType === '지출') {
            dataToPost.지출 = parseFloat(parseFloat(formData.amount).toFixed(2));
        } else {
            dataToPost.수입 = parseFloat(parseFloat(formData.amount).toFixed(2));
        }
        if (dataToPost.날짜 && dataToPost.카테고리 && (dataToPost.지출 || dataToPost.수입)) {
            try {
                if (updateData) {
                    const dataToUpdate = { _id: updateData._id, ...dataToPost };
                    await axios.put('/api/transactions', dataToUpdate);
                    exit(true);
                    return;
                }
                await axios.post('/api/transactions', dataToPost);
                setFormData({
                    ...formData,
                    success: true
                });
            } catch (err) {
                console.log(err);
            }
        }
    }
    const deleteData = async () => {
        if (deleteDataMessageTimeout) {
            doubleClick = true;
            clearTimeout(deleteDataMessageTimeout);
            setDeleteDataMessage('');
        }
        await axios.delete('/api/transactions', { data: { _id: updateData._id } });
        exit(true);
    }
    const showDeleteDataMessage = () => {
        deleteDataMessageTimeout = setTimeout(() => {
            if (!doubleClick) setDeleteDataMessage('더블클릭으로 지워주세요.');
        }, 500);
    }
    return (
        <>
            <Toaster position={Position.TOP} canEscapeKeyClear={true}>
                {formData.error.map(err => (
                    <Toast key={err} intent={Intent.DANGER} message={errorMessage(err)} icon='warning-sign' onDismiss={() => setFormData({ ...formData, error: formData.error.filter(e => e !== err) })} timeout={5000} />
                ))}
                {formData.success && (
                    <Toast intent={Intent.SUCCESS} message='입력완료!' icon='tick-circle' onDismiss={resetForm} timeout={3000} />
                )}
            </Toaster>
            <FormGroup>
                <div className='form-input-group' onKeyDown={(e) => keypress(e.code)}>
                    <Label htmlFor='amount' className='labels'>금액</Label>
                    <NumericInput id='amount' leftIcon='dollar' majorStepSize={10} minorStepSize={0.05}
                        onValueChange={(valueAsNumber, valueAsString) => setFormData({ ...formData, amount: valueAsString })} value={formData.amount}
                        buttonPosition='none' />
                </div>
                <div className='form-input-group' onKeyDown={(e) => keypress(e.code)} style={{ width: '100%' }}>
                    <RadioGroup
                        inline={true}
                        onChange={e => setFormData({ ...formData, transactionType: e.target.value })}
                        selectedValue={formData.transactionType}
                    >
                        <Radio label='지출' value='지출' />
                        <Radio label='수입' value='수입' />
                    </RadioGroup>
                </div>
                <div className='form-input-group' onKeyDown={(e) => keypress(e.code)}>
                    <Label htmlFor='date' className='labels'>날짜</Label>
                    <DateInput id='date' leftIcon='dollar'
                        onChange={selectedDate => setFormData({ ...formData, date: selectedDate })}
                        value={formData.date}
                        formatDate={date => moment(date).format('YYYY-MM-DD')}
                        placeholder='YYYY-MM-DD' parseDate={str => parseDate(str)} showActionsBar={true} todayButtonText='Today' />
                </div>
                <div className='form-input-group' onKeyDown={(e) => keypress(e.code)}>
                    <Label htmlFor='location' className='labels'>카테고리</Label>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <HTMLSelect onChange={e => setFormData({ ...formData, category: e.target.value })} value={formData.category}>
                            <option value=''></option>
                            {formData.transactionType && populateCategories()}
                        </HTMLSelect>
                    </div>
                    <input type='text' className={Classes.INPUT} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value.toLowerCase() })} />
                </div>
                <div className='form-input-group' onKeyDown={(e) => keypress(e.code)}>
                    <Label htmlFor='memo' className='labels'>메모</Label>
                    <TextArea
                        id='memo'
                        growVertically={true}
                        intent={Intent.PRIMARY}
                        onChange={e => setFormData({ ...formData, memo: e.target.value })}
                        value={formData.memo}
                    />
                </div>
                <hr style={{ width: '100%' }} />
                {updateData ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Toaster position={Position.TOP} canEscapeKeyClear={true}>
                            {deleteDataMessage && (
                                <Toast intent={Intent.PRIMARY} message={deleteDataMessage} icon='hand' onDismiss={() => setDeleteDataMessage('')} timeout={5000} />
                            )}
                        </Toaster>
                        <Button icon='saved' className='btn-submit' text='Submit' type='button' intent={Intent.SUCCESS} onClick={postData} />
                        <Button icon='trash' className='btn-submit' text='Delete' type='button' intent={Intent.DANGER} onClick={showDeleteDataMessage} onDoubleClick={deleteData} />
                        <Button icon='reset' className='btn-submit' text='Cancel' type='button' intent={Intent.NONE} onClick={() => exit(false)} />
                    </div>
                ) : (
                    <Button icon='saved' className='btn-submit' text='Submit' type='button' intent={Intent.SUCCESS} onClick={postData} />
                )}
            </FormGroup >
        </>
    )
}

export default Form;