import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ApiError } from '@entrelinhas/api-client';
import type { ProfilePublic } from '@entrelinhas/contracts';
import { api } from '../../api';
import { useSession } from '../../app/session';
import { Button, Icon, TextField } from '../../components';
import './login.css';

type ProfilesState = { status: 'loading' | 'error'; items: ProfilePublic[] } | { status: 'ready'; items: ProfilePublic[] };
export function LoginPage() {
  const [profiles, setProfiles] = useState<ProfilesState>({ status: 'loading', items: [] });
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signedIn } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const controller = new AbortController();
    api.listPublicProfiles({ signal: controller.signal }).then(
      ({ items }) => {
        setProfiles({ status: 'ready', items });
        setSelectedId((current) => items.some((item) => item.id === current) ? current : items[0]?.id ?? '');
      },
      () => { if (!controller.signal.aborted) setProfiles({ status: 'error', items: [] }); },
    );
    return () => controller.abort();
  }, [attempt]);
  const selected = profiles.items.find((item) => item.id === selectedId);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId || !password || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const session = await api.createSession({ household_password: password, profile_id: selectedId });
      signedIn(session);
      const from: unknown = (location.state as { from?: unknown } | null)?.from;
      void navigate(typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/library', { replace: true });
    } catch (reason) {
      if (reason instanceof ApiError) {
        if (reason.status === 429) setError(`Muitas tentativas. Tente novamente em ${reason.retryAfterSeconds ?? 30} segundos.`);
        else if (reason.status === 401) setError('Senha da casa incorreta.');
        else if (reason.status === 503) setError('Servidor indisponível no momento. Tente de novo.');
        else setError(reason.outcomeUnknown ? 'Não foi possível confirmar a entrada. Tente de novo.' : reason.message);
      } else setError('Erro inesperado. Tente de novo.');
    } finally { setSubmitting(false); }
  }
  return <main className="login-page"><section className="login-card" aria-labelledby="login-title">
    <div className="login-brand"><Icon name="headphones" size={23} /><span>entrelinhas</span></div>
    <h1 id="login-title">Quem vai ouvir?</h1>
    <p className="login-subtitle">Entre com a senha da casa e escolha seu perfil.</p>
    <form onSubmit={(event) => { void submit(event); }}>
      <TextField label="Senha da casa" type="password" autoComplete="current-password" required value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} {...(error ? { error } : {})} />
      <fieldset className="login-profiles" disabled={submitting}><legend>Perfil</legend>
        {profiles.status === 'loading' ? <p role="status">Carregando perfis…</p> : null}
        {profiles.status === 'error' ? <div role="alert">Não foi possível carregar os perfis. <Button variant="ghost" onClick={() => setAttempt((value) => value + 1)}>Tentar de novo</Button></div> : null}
        {profiles.status === 'ready' && profiles.items.length === 0 ? <p>Nenhum perfil disponível.</p> : null}
        {profiles.status === 'ready' && profiles.items.length > 0 ? <div className="login-profile-grid" role="radiogroup" aria-label="Perfil">{profiles.items.map((profile) => <label className="login-profile" key={profile.id}>
          <input type="radio" name="profile" value={profile.id} checked={selectedId === profile.id} onChange={() => setSelectedId(profile.id)} />
          <span className="login-profile__avatar" aria-hidden="true">{profile.initials}</span><span className="login-profile__name">{profile.display_name}</span>
        </label>)}</div> : null}
      </fieldset>
      {selected?.has_pin ? <p className="login-pin-note">{selected.display_name.split(' ')[0]} usa PIN para capturas privadas.</p> : null}
      <Button type="submit" className="login-submit" disabled={!selectedId || submitting}>{submitting ? 'Entrando…' : 'Entrar'}</Button>
    </form>
    <p className="login-explanation">A senha da casa abre só a biblioteca comum. Capturas privadas pedem o PIN do perfil e administração pede login individual.</p>
    <Link className="login-admin-link" to="/admin/login">Entrar como administrador</Link>
  </section></main>;
}
