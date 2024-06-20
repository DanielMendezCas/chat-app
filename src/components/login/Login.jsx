import { useState } from 'react';
import './login.css'
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import { auth, db, storage} from '@/lib/firebase.js';
import { doc, setDoc } from 'firebase/firestore';
import upload from '../../lib/upload';



const Login = () => {

    const [avatar, setAvatar] = useState({
        file : null,
        url : ""
    });

    const [loading, setLoading] = useState(false);

    const handleAvatar = e => {
        if(e.target.files[0]){
            setAvatar({
            file: e.target.files[0],
            url : URL.createObjectURL(e.target.files[0])
        })
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true);
        const formData = new FormData(e.target);
        const {email, password} = Object.fromEntries(formData);

        try{
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Se inició sesión correctamente");
        }catch(err){
            console.error(err);
            toast.error("Correo y/o contraseña inválidos");
        }finally{
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const {username, email, password} = Object.fromEntries(formData);
        
        try{
            const resp = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Usuario registrado:', resp.user);

            const imgUrl = await upload(avatar.file);

            await setDoc(doc(db, "users", resp.user.uid),{
                username,
                email,
                avatar: imgUrl,
                id: resp.user.uid,
                blocked: []
            });

            await setDoc(doc(db, "userchats", resp.user.uid),{
                chats : [],
            });

            toast.success("Cuenta creada correctamente!")

        }catch(err){
            console.error(err);
            toast.error(err.message);
        }finally{
            setLoading(false);
        }
    }
    
    return(
        <div className="login">
            <div className="item">
                <h2>Bienvenido</h2>
                <form onSubmit = {handleLogin} >
                    <input type="text" name="email" placeholder='Correo'/>
                    <input type="password" name="password" placeholder='Contraseña'/>
                    <button disabled = {loading} > {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Crear una Cuenta</h2>
                <form onSubmit = {handleRegister} >
                    <label htmlFor="file"> <img src={avatar.url || './avatar.png'} alt=""/>
                    Sube una Imagen</label>
                    <input type="file" id='file' style={{display : 'none'}} onChange = {handleAvatar} />
                    <input type="text" name='username' placeholder='Nombre de Usuario'/>
                    <input type="text" name="email" placeholder='Correo'/>
                    <input type="password" name="password" placeholder='Contraseña'/>
                    <button disabled = {loading} > {loading ? "Registrando..." : "Registrarse"}</button>
                </form>
            </div>
        </div>
    );
}

export default Login;