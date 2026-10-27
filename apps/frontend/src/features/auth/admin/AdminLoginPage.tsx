import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ApiError } from '@entrelinhas/api-client';
import { api } from '../../../api';
import { Button, Icon, TextField } from '../../../components';
import '../login.css';
import './admin-login.css';

export function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [passkeyNotice, setPasskeyNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sanitizedTotp = totpCode.replace(/\s+/g, '');
    if (!username || !password || !sanitizedTotp || submitting) return;
    if (!/^\d{6}$/.test(sanitizedTotp)) {
      setPasskeyNotice('');
      setError('Informe o código de 6 dígitos do aplicativo autenticador.');
      return;
    }

    setError('');
    setPasskeyNotice('');
    setSubmitting(true);

    try {
      await api.createAdminSession({
        username: username.trim(),
        password,
        totp_code: sanitizedTotp,
      });
      void navigate('/admin', { replace: true });
    } catch (reason) {
      if (reason instanceof ApiError) {
        if (reason.status === 429) {
          setError(
            `Muitas tentativas. Aguarde ${reason.retryAfterSeconds ?? 30} segundos para tentar de novo. Os outros perfis da casa não são bloqueados.`,
          );
        } else if (reason.status === 401) {
          setError('Usuário, senha ou código incorretos.');
        } else if (reason.status === 503) {
          setError('Servidor indisponível no momento. Tente de novo.');
        } else {
          setError(reason.outcomeUnknown ? 'Não foi possível confirmar o acesso. Tente de novo.' : reason.message);
        }
      } else {
        setError('Erro inesperado. Tente de novo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handlePasskey() {
    setError('');
    setPasskeyNotice('O acesso por passkey está indisponível nesta versão simulada.');
  }

  const isFormValid = Boolean(username && password && totpCode.replace(/\s+/g, ''));

  return (
    <main className="login-page">
      <section className="login-card admin-login-card" aria-labelledby="admin-login-title">
        <div className="login-brand">
          <Icon name="headphones" size={23} />
          <span>entrelinhas</span>
        </div>
        <h1 id="admin-login-title">Acesso de administrador</h1>
        <p className="login-subtitle">Credencial individual, diferente da senha da casa e do PIN.</p>
        <form
          onSubmit={(event) => {
            void submit(event);
          }}
        >
          <div className="admin-login-fields">
            <TextField
              label="Usuário"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
                setPasskeyNotice('');
              }}
            />
            <TextField
              label="Senha"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
                setPasskeyNotice('');
              }}
            />
            <TextField
              label="Código do aplicativo autenticador"
              name="totp_code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={totpCode}
              onChange={(e) => {
                setTotpCode(e.target.value);
                setError('');
                setPasskeyNotice('');
              }}
            />
          </div>

          {error ? (
            <div className="admin-login-alert" role="alert">
              {error}
            </div>
          ) : null}

          {passkeyNotice ? (
            <div className="admin-login-notice" role="status">
              {passkeyNotice}
            </div>
          ) : null}

          <div className="admin-login-actions">
            <Button
              type="submit"
              className="login-submit admin-login-submit"
              disabled={!isFormValid || submitting}
            >
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="admin-login-passkey"
              onClick={handlePasskey}
            >
              Usar passkey
            </Button>
          </div>
        </form>

        <p className="admin-login-lockout login-explanation">
          Depois de 5 tentativas erradas, aguarde 15 minutos. Os outros perfis da casa não são bloqueados.
        </p>
        <Link className="admin-login-back" to="/login">
          Voltar
        </Link>
      </section>
    </main>
  );
}
