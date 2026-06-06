import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import {
  Calendar,
  Card,
  Chart,
  Checklist,
  DataToolbar,
  FileUpload,
  I18nProvider,
  InlineEdit,
  KpiGrid,
  Lightbox,
  LocalePicker,
  Meter,
  MobileShell,
  Progress,
  SegmentedControl,
  Stat,
  TextArea,
  useGallery,
  useMediaQuery,
  useT,
} from '../index';

afterEach(() => cleanup());

describe('Card', () => {
  it('composes Header/Title/Body/Footer', () => {
    const { container, getByText } = render(
      <Card>
        <Card.Header>
          <Card.Title>Title</Card.Title>
        </Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Foot</Card.Footer>
      </Card>,
    );
    expect(container.querySelector('.card')).toBeTruthy();
    expect(container.querySelector('.card-header')).toBeTruthy();
    expect(container.querySelector('.card-footer')).toBeTruthy();
    expect(getByText('Title')).toBeTruthy();
  });
});

describe('Calendar', () => {
  it('selects a day and fires onChange', () => {
    const onChange = vi.fn();
    const month = new Date(2026, 5, 1); // June 2026
    const { container } = render(
      <Calendar month={month} onChange={onChange} weekStartsOn={1} />,
    );
    const cells = container.querySelectorAll<HTMLButtonElement>('.cal-day');
    // Find the cell labelled "15"
    const fifteenth = Array.from(cells).find((b) => b.textContent === '15' && !b.disabled);
    expect(fifteenth).toBeTruthy();
    fireEvent.click(fifteenth!);
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Chart', () => {
  it('renders a line chart with a polyline', () => {
    const { container } = render(
      <Chart.Line data={[{ x: 0, y: 1 }, { x: 1, y: 5 }, { x: 2, y: 3 }]} />,
    );
    expect(container.querySelector('svg polyline')).toBeTruthy();
  });
  it('renders bar/donut/sparkline', () => {
    const { container } = render(
      <div>
        <Chart.Bar data={[{ label: 'A', value: 2 }, { label: 'B', value: 5 }]} />
        <Chart.Donut data={[{ label: 'A', value: 1 }, { label: 'B', value: 2 }]} />
        <Chart.Sparkline data={[1, 4, 2, 6]} />
      </div>,
    );
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(3);
  });
});

describe('Checklist', () => {
  it('toggles an item', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <Checklist>
        <Checklist.Item title="Sign up" done={false} onToggle={onToggle} />
      </Checklist>,
    );
    fireEvent.click(container.querySelector('button.checklist-check')!);
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});

describe('Meter', () => {
  it('exposes ARIA meter role and value', () => {
    const { container } = render(<Meter value={70} low={20} high={80} />);
    const el = container.querySelector('.meter')!;
    expect(el.getAttribute('role')).toBe('meter');
    expect(el.getAttribute('aria-valuenow')).toBe('70');
  });
});

describe('Progress', () => {
  it('renders a progressbar with width', () => {
    const { container } = render(<Progress value={0.5} />);
    const el = container.querySelector('.progress')!;
    expect(el.getAttribute('role')).toBe('progressbar');
    const bar = container.querySelector<HTMLElement>('.progress-bar')!;
    expect(bar.style.width).toBe('50%');
  });
});

describe('SegmentedControl', () => {
  it('marks active and emits change', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SegmentedControl
        value="a"
        onChange={onChange}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    );
    const btns = container.querySelectorAll('button');
    expect(btns[0]!.getAttribute('aria-checked')).toBe('true');
    fireEvent.click(btns[1]!);
    expect(onChange).toHaveBeenCalledWith('b');
  });
});

describe('MobileShell', () => {
  it('renders body + bottom tabs', () => {
    const { container } = render(
      <MobileShell>
        <MobileShell.Body>body</MobileShell.Body>
        <MobileShell.BottomTabs
          value="a"
          items={[{ value: 'a', label: 'A' }]}
        />
      </MobileShell>,
    );
    expect(container.querySelector('.mobile-shell')).toBeTruthy();
    expect(container.querySelector('.b-bottom-tabs')).toBeTruthy();
  });
});

describe('InlineEdit', () => {
  it('saves on Enter', () => {
    const onSave = vi.fn();
    function Wrap() {
      return <InlineEdit value="hi" onSave={onSave} />;
    }
    const { container } = render(<Wrap />);
    fireEvent.click(container.querySelector('.p-inline-edit')!);
    const input = container.querySelector<HTMLInputElement>('input')!;
    fireEvent.change(input, { target: { value: 'bye' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSave).toHaveBeenCalledWith('bye');
  });
});

describe('TextArea', () => {
  it('renders a textarea element', () => {
    const { container } = render(<TextArea defaultValue="hi" />);
    expect(container.querySelector('textarea')).toBeTruthy();
  });
});

describe('DataToolbar', () => {
  it('renders sub-slots', () => {
    const { container } = render(
      <DataToolbar>
        <DataToolbar.Search>s</DataToolbar.Search>
        <DataToolbar.Filters>f</DataToolbar.Filters>
        <DataToolbar.Actions>a</DataToolbar.Actions>
      </DataToolbar>,
    );
    expect(container.querySelector('.b-data-toolbar-search')).toBeTruthy();
    expect(container.querySelector('.b-data-toolbar-filters')).toBeTruthy();
    expect(container.querySelector('.b-data-toolbar-actions')).toBeTruthy();
  });
});

describe('I18nProvider + useT', () => {
  it('interpolates messages', () => {
    function HelloOut() {
      const t = useT();
      return <span>{t('hello', { name: 'World' })}</span>;
    }
    const { getByText } = render(
      <I18nProvider locale="en" messages={{ hello: 'Hello, {name}!' }}>
        <HelloOut />
      </I18nProvider>,
    );
    expect(getByText('Hello, World!')).toBeTruthy();
  });
});

describe('LocalePicker', () => {
  it('lists locales from context', () => {
    const setLocale = vi.fn();
    const { container } = render(
      <I18nProvider
        locale="en"
        setLocale={setLocale}
        messages={{}}
        locales={[
          { code: 'en', label: 'English' },
          { code: 'fr', label: 'Français' },
        ]}
      >
        <LocalePicker />
      </I18nProvider>,
    );
    const opts = container.querySelectorAll('option');
    expect(opts.length).toBe(2);
    fireEvent.change(container.querySelector('select')!, { target: { value: 'fr' } });
    expect(setLocale).toHaveBeenCalledWith('fr');
  });
});

describe('Lightbox + useGallery', () => {
  it('shows current image and navigates', () => {
    function Wrap() {
      const g = useGallery(0, 2);
      return (
        <>
          <button type="button" onClick={() => g.show(0)}>open</button>
          <Lightbox
            open={g.open}
            index={g.index}
            onClose={g.close}
            onChange={g.setIndex}
            images={[
              { src: 'a.jpg', alt: 'A' },
              { src: 'b.jpg', alt: 'B' },
            ]}
          />
        </>
      );
    }
    const { getByText, getByAltText } = render(<Wrap />);
    fireEvent.click(getByText('open'));
    expect(getByAltText('A')).toBeTruthy();
  });
});

describe('FileUpload', () => {
  it('fires onFiles on input change', () => {
    const onFiles = vi.fn();
    const { container } = render(<FileUpload onFiles={onFiles} />);
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['x'], 'x.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalled();
  });
});

describe('KpiGrid', () => {
  it('wraps children in a grid', () => {
    const { container } = render(
      <KpiGrid>
        <div>a</div>
        <div>b</div>
      </KpiGrid>,
    );
    expect(container.querySelector('.kpi-grid')).toBeTruthy();
  });
});

describe('Stat (alias for StatCard)', () => {
  it('renders label/value', () => {
    const { container, getByText } = render(<Stat label="Score" value="42" />);
    expect(container.querySelector('.stat-tile')).toBeTruthy();
    expect(getByText('42')).toBeTruthy();
  });
});

describe('useMediaQuery', () => {
  it('returns a boolean', () => {
    function Probe() {
      const m = useMediaQuery('(min-width: 0px)');
      return <span>{String(m)}</span>;
    }
    const { container } = render(<Probe />);
    expect(['true', 'false']).toContain(container.textContent);
  });
});
