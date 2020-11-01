import Axios from 'axios';
import React, { useEffect, useState} from 'react'
import {Link, useHistory} from 'react-router-dom'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const Payment = ({status,ordenID,checkID}) => {
    console.log(status)
    const history = useHistory()
    const [pago,setPago] = useState({
        comprobante:''
    })
    const [modal,setModal] = useState(false)
    const paymentUpdate = async() => {
        let check = JSON.parse(localStorage.getItem('checkout'))
        await Axios.put(`http://localhost:3001/orders/payment/${check[1]}?status=${status}`)
    }
    const toggle = () => setModal(!modal)
    const cancelado = async() => {
        let check = JSON.parse(localStorage.getItem('checkout'))
        await Axios.delete(`http://localhost:3001/orders/checkout/${check[1]}`)
        await Axios.put(`http://localhost:3001/orders/${check[0]}?status=carrito`)
    }
    const sendMail = async() => {
        const {data} = await Axios.post(`http://localhost:3001/orders/mail?status=${status}`)
        console.log(data)
    }

    useEffect(()=> {
        if(status !== 'pago'){
            if(status === 'Cancelado'){
            cancelado()
            }else if(status === 'Pagado'){
                paymentUpdate()
                //aqui mi compra y mando me correo 
                sendMail()
            }else if(status === 'Pendiente'){
                sendMail()
            }
        }
        toggle()
    },[])

    const uploadImage = async (e) => {

        const file = e.target.files[0]
        const base64 = await convertBase64(file)
        // console.log(base64)
        setPago({
            ...pago,
            comprobante:base64});
        e.preventDefault();
    };

    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = () => {
                resolve(fileReader.result)
            }

            fileReader.onerror = (error) => {
                reject(error);
            }
        })
    };

    const confirmar = async() => {
        await Axios.put(`http://localhost:3001/orders/payment/${checkID}?status=Pagado`,pago)
        await alert('Gracias! Tu orden será procesada.')
        history.push('/login')
    }

    const handleSubmit = (e) => {
        setPago({
            comprobante:''
        })
        e.preventDefault(e)
    }

    return(
        <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader style={{justifyContent:'center'}}>
                {(status ===  'Pagado') && '¡Gracias por su compra!, su orden será procesada.'}
                {(status ===  'Pendiente') && '¡Gracias por su compra!, su pago está pendiente.'}
                {(status ===  'Cancelado') && '¡Lo sentimos! La compra no se concretó, intente otra vez.'}
                {status === 'pago' && 'CONFIRMACIÓN DE PAGO'}
            </ModalHeader>
            {status === 'pago' && 
                <ModalBody>
                    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column'}}>
                        <label>Orden de compra: N° {ordenID}</label>
                        <div style={{display:'flex',alignItems:'center'}}>
                            <label style={{width:'40%',margin:'0'}}>Ingresa el comprobante:</label>
                            <input style={{width:'60%',overflow:'hidden'}} type='file' onChange={uploadImage}/>
                        </div>
                        <button style={{marginTop:'10px'}} className='btn btn-dark' type='button' onClick={confirmar}>Confirmar</button>
                    </form>
                </ModalBody>
            }
            {status !== 'pago' && <Link type='button' className='btn btn-dark' to='/catalogo'>Aceptar</Link>}
        </Modal>
    )
}

export default Payment;