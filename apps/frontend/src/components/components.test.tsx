import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Avatar, Badge, Button, Callout, Card, Chip, Icon, IconButton, Select, TextField, Toggle } from '.';

describe('Button', () => {
  test('is type=button by default so it never submits forms by accident', () => {
    render(<Button>Adicionar URL</Button>);
    expect(screen.getByRole('button', { name: 'Adicionar URL' })).toHaveAttribute('type', 'button');
  });

  test('variants map to classes and disabled blocks clicks', async () => {
    const onClick = vi.fn();
    render(
      <Button variant="danger" disabled onClick={onClick}>
        Excluir
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Excluir' });
    expect(button).toHaveClass('el-button', 'el-button--danger');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('outline variant exists as specified in TASK-004 (review 9519f4c #3)', () => {
    render(<Button variant="outline">Carregar mais</Button>);
    expect(screen.getByRole('button', { name: 'Carregar mais' })).toHaveClass('el-button--outline');
  });

  test('icon button requires and exposes an accessible label', async () => {
    const onClick = vi.fn();
    render(<IconButton icon="pause" label="Pausar" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Pausar' }).querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  test('submit type can be requested explicitly', () => {
    render(<Button type="submit">Entrar</Button>);
    expect(screen.getByRole('button', { name: 'Entrar' })).toHaveAttribute('type', 'submit');
  });
});

describe('Toggle', () => {
  function Harness() {
    const [on, setOn] = useState(false);
    return <Toggle label="Analisar imagens com um modelo visual" description="Aplica-se ao OpenRouter" checked={on} onChange={setOn} />;
  }

  test('is a switch with state, label and description, operable by mouse and keyboard', async () => {
    render(<Harness />);
    const toggle = screen.getByRole('switch', { name: 'Analisar imagens com um modelo visual' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toHaveAccessibleDescription('Aplica-se ao OpenRouter');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    toggle.focus();
    await userEvent.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });
});

describe('TextField and Select', () => {
  test('label, hint and error are associated; error marks the field invalid', () => {
    render(<TextField label="Senha da casa" type="password" hint="Só abre a biblioteca comum." error="Senha incorreta." />);
    const input = screen.getByLabelText('Senha da casa');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Só abre a biblioteca comum. Senha incorreta.');
    expect(screen.getByText('Senha incorreta.')).toHaveAttribute('role', 'alert');
  });

  test('caller aria-describedby is merged, never replacing hint/error (review 9519f4c #2)', () => {
    render(
      <>
        <p id="ext">Formato: https://</p>
        <TextField label="URL" error="URL inválida." aria-describedby="ext" aria-invalid={false} />
      </>,
    );
    const input = screen.getByLabelText('URL');
    expect(input).toHaveAccessibleDescription('Formato: https:// URL inválida.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('field without error is valid and has no alert', () => {
    render(<TextField label="URL do artigo" />);
    expect(screen.getByLabelText('URL do artigo')).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test('select exposes options and change', async () => {
    const onChange = vi.fn();
    render(
      <Select
        label="Validade"
        value="24h"
        onChange={(e) => onChange(e.target.value)}
        options={[
          { value: '24h', label: '24 horas' },
          { value: '3d', label: '3 dias' },
        ]}
      />,
    );
    await userEvent.selectOptions(screen.getByLabelText('Validade'), '3d');
    expect(onChange).toHaveBeenCalledWith('3d');
  });
});

describe('display components', () => {
  test('badge contributes a full phrase to its container name, not just a number (review 9519f4c #1)', () => {
    render(
      <a href="/n">
        Notificações <Badge count={2} label="notificações não lidas" />
      </a>,
    );
    expect(screen.getByRole('link')).toHaveAccessibleName('Notificações 2 notificações não lidas');
  });

  test('badge with zero renders nothing', () => {
    const { container } = render(<Badge count={0} label="notificações" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('card is a labelled region with heading at the requested level', () => {
    render(
      <Card title="Artigos convertidos" headingLevel={2}>
        conteúdo
      </Card>,
    );
    expect(screen.getByRole('region', { name: 'Artigos convertidos' })).toContainElement(screen.getByRole('heading', { level: 2 }));
  });

  test('card without title is a plain container', () => {
    render(<Card>só conteúdo</Card>);
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.getByText('só conteúdo')).toHaveClass('el-card');
  });

  test('chip, callout and avatar', () => {
    render(
      <>
        <Chip tone="accent">Ciência</Chip>
        <Callout title="Vaga garantida para pedidos manuais" tone="warning">
          A automação nunca ocupa a reserva.
        </Callout>
        <Avatar initials="EA" />
      </>,
    );
    expect(screen.getByText('Ciência')).toHaveClass('el-chip', 'el-chip--accent');
    expect(screen.getByText('Vaga garantida para pedidos manuais').closest('.el-callout')).toHaveClass('el-callout--warning');
    expect(screen.getByText('EA')).toHaveAttribute('aria-hidden', 'true');
  });

  test('icons are decorative unless titled', () => {
    const { container } = render(
      <>
        <Icon name="home" />
        <Icon name="download" title="Baixar" />
      </>,
    );
    const [decorative, titled] = Array.from(container.querySelectorAll('svg'));
    expect(decorative).toHaveAttribute('aria-hidden', 'true');
    expect(titled).toHaveAccessibleName('Baixar');
  });
});
