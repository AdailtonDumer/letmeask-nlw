import { FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';

import illustrationImg from '../assets/illustration.svg';
import logoImg from '../assets/logo.svg';
import googleIconImg from '../assets/google-icon.svg';

import { Button } from '../components/Button';

import '../styles/auth.scss';

export function Home() {
    const history = useHistory();
    const { user, signInWithGoogle } = useAuth();
    const [roomCode, setRoomCode] = useState('');

    async function handleSignIn() {
        if(!user)
          await signInWithGoogle();
        history.push('/rooms/new');
    }

    async function handleJoinRoom(e : FormEvent) {
        e.preventDefault();
        
        if(roomCode.trim() === '')
            return;

        const roomRef = await database.ref(`rooms/${roomCode}`).get();

        if(!roomRef.exists()){
            alert('Sala não encontrada');
            return;
        }

        history.push(`rooms/${roomCode}`)
    }
    return (
        <div id="auth">
            <aside>
                <img src={illustrationImg} alt="Ilustração de perguntas e respostas" />
                <strong>Crie salas de Q&amp;A ao-vivo</strong>
                <p>Tire as dúvidas da sua audiência em tempo-real</p>
            </aside>
            <main>
                <div className="main-container">
                    <img src={logoImg} alt="Letmeask" />
                    <button className="btn-create-room" onClick={handleSignIn}>
                        <img src={googleIconImg} alt="Icone do Google" />
                        Cire sua sala com o Google
                    </button>
                    <div className="separator">ou entre em uma sala</div>
                    <form onSubmit={handleJoinRoom}>
                        <input
                            type="text"
                            placeholder="Digite o código da sala"
                            onChange={event => setRoomCode(event.target.value)}
                            value = {roomCode}
                        />
                        <Button type="submit" >
                            Entrar na sala
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    )
}
