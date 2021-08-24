import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { database } from '../services/firebase'
import { useAuth } from '../hooks/useAuth'

import logoImg from '../assets/logo.svg'
import { Button } from '../components/Button'
import { RoomCode } from '../components/RoomCode'

import '../styles/room.scss'

type RoomParams = {
  id: string,
}

type FirebaseQuestions = Record<string, {
  author: {
    avatar: string,
    name: string,
  },
  content: string,
  isHighlighted: boolean,
  isAnswered: boolean,
}>;

type Question = {
  id: string,
  author: {
    avatar: string,
    name: string,
  },
  content: string,
  isHighlighted: boolean,
  isAnswered: boolean,
}

export function Room() {
  const { user } = useAuth();
  const params = useParams<RoomParams>();
  const [newQuestion, setNewQuestion] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState('');

  const roomId = params.id;

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);
    roomRef.on('value', (room) => {
      const firebaseQuestions : FirebaseQuestions = room.val().questions;

      const parsedQuestions = Object.entries(firebaseQuestions ?? {}).map(([key, value]) => {
        return{
          id: key,
          content: value.content,
          author: value.author,
          isHighlighted: value.isHighlighted,
          isAnswered: value.isAnswered,
        }
      });

      setTitle(room.val().title);
      setQuestions(parsedQuestions);
    })
  }, [roomId])

  async function handleSendQuestion(e : FormEvent) {
    e.preventDefault();
    if (newQuestion.trim() == '')
      return;

    if (!user)
      throw new Error('Faça login para enviar uma pergunta.');

    const question = {
      content: newQuestion,
      author: {
        name: user.name,
        avatar: user.avatar
      },
      isHighlighted:false,
      isAnswered: false
    };

    await database.ref(`rooms/${roomId}/questions`).push(question);
    setNewQuestion('');
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="letmeask" />
          <RoomCode code={roomId} />
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>{title}</h1>
          {questions.length > 0 && <span>{questions.length} perguntas</span>}
        </div>

        <form onSubmit={handleSendQuestion}>
          <textarea
            placeholder="O que deseja perguntar"
            onChange={event => setNewQuestion(event.target.value)}
            value={newQuestion}
          />

          <div className="form-footer">
            {user ? (
              <div className="user-info">
                <img src={user.avatar} alt={user.name} />
                <span>{user.name}</span>
              </div>
            ) : (
              <span>Para enviar uma pergunta, <button>Clique aqui</button></span>
            )}
            <Button type="submit" disabled={!user}>Enviar pergunta</Button>
          </div>
        </form>
        <div>
        </div>
      </main>
    </div>
  )
}
