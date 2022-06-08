import React, { useState, useEffect } from 'react';
import { Button, FormGroup, HTMLSelect, Label, NumericInput, Position, Radio, RadioGroup, TextArea, Toast, Toaster, Classes, Intent } from '@blueprintjs/core';
import { DateInput } from '@blueprintjs/datetime';

const Form = ({ data, updateData, exit }) => {
    useEffect(() => {
        if (updateData) {
            const amount = updateData.지출 || updateData.수입;
            const date = new Date(updateData.날짜);
            const category = updateData.카테고리;
            const transactionType = updateData.지출 ? '지출' : '수입';
            const memo = updateData.메모;
            setFormData({
                ...formData,
                amount,
                date,
                category,
                transactionType,
                memo
            });
        }
    }, []);
    const [formData, setFormData] = useState({
        amount: null,
        date: new Date(),
        category: '',
        transactionType: null,
        memo: '',
        error: []
    });
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
            날짜: `${formData.date.getFullYear()}-${(`0${formData.date.getMonth() + 1}`).slice(-2)}-${(`0${formData.date.getDate()}`).slice(-2)}`,
            카테고리: formData.category,
            메모: formData.memo
        };
        if (formData.transactionType === '지출') {
            dataToPost.지출 = parseFloat(formData.amount);
        } else {
            dataToPost.수입 = parseFloat(formData.amount);
        }
        if (dataToPost.날짜 && dataToPost.카테고리 && (dataToPost.지출 || dataToPost.수입)) {
            try {
                if (updateData) {
                    console.log(updateData);
                }
                // await axios.post('/api/transactions', dataToPost);
                console.log('Ready to post');
            } catch (err) {
                console.log(err);
            }
        }
        console.log(dataToPost);
    }
    const deleteData = () => {
        console.log('deleting data');
    }
    return (
        <>
            <Toaster position={Position.TOP} canEscapeKeyClear={true}>
                {formData.error.map(err => (
                    <Toast key={err} intent={Intent.DANGER} message={errorMessage(err)} icon='warning-sign' onDismiss={() => setFormData({ ...formData, error: formData.error.filter(e => e !== err) })} timeout={5000} />
                ))}
            </Toaster>
            <FormGroup>
                <div className='form-input-group'>
                    <Label htmlFor='amount' className='labels'>금액</Label>
                    <NumericInput id='amount' leftIcon='dollar' majorStepSize={10} minorStepSize={0.05}
                        onValueChange={(valueAsNumber, valueAsString) => setFormData({ ...formData, amount: valueAsString })} value={formData.amount}
                        buttonPosition='none' />
                </div>
                <div style={{ width: '100%' }}>
                    <RadioGroup
                        inline={true}
                        onChange={e => setFormData({ ...formData, transactionType: e.target.value })}
                        selectedValue={formData.transactionType}
                    >
                        <Radio label='지출' value='지출' />
                        <Radio label='수입' value='수입' />
                    </RadioGroup>
                </div>
                <div className='form-input-group'>
                    <Label htmlFor='date' className='labels'>날짜</Label>
                    <DateInput id='date' leftIcon='dollar'
                        onChange={selectedDate => setFormData({ ...formData, date: selectedDate })}
                        value={formData.date}
                        formatDate={date => `${date.getFullYear()}-${(`0${date.getMonth() + 1}`).slice(-2)}-${(`0${date.getDate()}`).slice(-2)}`} placeholder='YYYY-MM-DD'
                        parseDate={str => new Date(str)} showActionsBar={true} todayButtonText='Today' />
                </div>
                <div className='form-input-group'>
                    <Label htmlFor='location' className='labels'>카테고리</Label>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <HTMLSelect onChange={e => setFormData({ ...formData, category: e.target.value })} value={formData.category}>
                            <option value=''></option>
                            {formData.transactionType && populateCategories()}
                        </HTMLSelect>
                    </div>
                    <input type='text' className={Classes.INPUT} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value.toLowerCase() })} />
                </div>
                <div className='form-input-group'>
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
                        <Button icon='saved' className='btn-submit' text='Submit' type='button' intent={Intent.SUCCESS} onClick={postData} />
                        <Button icon='trash' className='btn-submit' text='Delete' type='button' intent={Intent.DANGER} onDoubleClick={deleteData} />
                        <Button icon='reset' className='btn-submit' text='Cancel' type='button' intent={Intent.NONE} onClick={exit} />
                    </div>
                ) : (
                    <Button icon='saved' className='btn-submit' text='Submit' type='button' intent={Intent.SUCCESS} onClick={postData} />
                )}
            </FormGroup >
        </>
    )
}

export default Form;