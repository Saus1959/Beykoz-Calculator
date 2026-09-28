import { useState, useMemo, useEffect, useRef } from "react";
import { MENU, NAMES } from "./data";
import { useLocalStorage } from "./useLocalStorage";

const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2);
// Напитки вроде «Coca-Cola 1L» / «2L» автоматически считаются общими
const isShared = (name) => /\b\d(?:[.,]\d)?\s?(?:l|litr|л)\b/i.test(name);

function PriceInput({ value, onChange }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    if (parseFloat(text) !== value) setText(String(value));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      className="pin"
      type="number"
      step="0.05"
      min="0"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const v = parseFloat(e.target.value);
        if (!isNaN(v) && v >= 0) onChange(v);
      }}
    />
  );
}

function ModeSwitch({ mode, setMode }) {
  return (
    <div className="modes" role="tablist">
      <button
        role="tab"
        aria-selected={mode === "equal"}
        className={mode === "equal" ? "on" : ""}
        onClick={() => setMode("equal")}
      >
        Немецкий<small>общий счёт поровну</small>
      </button>
      <button
        role="tab"
        aria-selected={mode === "items"}
        className={mode === "items" ? "on" : ""}
        onClick={() => setMode("items")}
      >
        Кто что ел<small>каждый за своё</small>
      </button>
    </div>
  );
}

function People({ mode, table, setTable, sel, setSel }) {
  const toggleTable = (n) => {
    if (table.includes(n)) {
      setTable(table.filter((x) => x !== n));
      setSel(sel.filter((x) => x !== n));
    } else setTable([...table, n]);
  };
  const toggleSel = (n) =>
    setSel(sel.includes(n) ? sel.filter((x) => x !== n) : [...sel, n]);
  const hint =
    sel.length === 0
      ? "Быстрый выбор (по желанию): отметь, кто ест, и новые блюда сразу запишутся на них. Кому именно блюдо, можно менять и в заказе ниже."
      : sel.length === 1
        ? `Новые блюда записываются на ${sel[0]}.`
        : `Новые блюда делятся поровну между ${sel.length} чел.`;
  return (
    <section>
      <h2>
        1. Кто за столом{" "}
        {table.length > 0 && <span className="who">({table.length})</span>}
      </h2>
      <div className="chips">
        {NAMES.map((n) => (
          <button
            key={n}
            className={"chip" + (table.includes(n) ? " on" : "")}
            onClick={() => toggleTable(n)}
          >
            {n}
          </button>
        ))}
      </div>
      {mode === "items" && (
        <div className="assign">
          <p className="hint">
            {table.length
              ? hint + " Напитки 1L/2L всегда делятся на всех."
              : "Сначала отметь, кто за столом."}
          </p>
          <div className="chips">
            {table.map((n) => (
              <button
                key={n}
                className={"chip ord" + (sel.includes(n) ? " on" : "")}
                onClick={() => toggleSel(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Menu({
  categories,
  price,
  setPrice,
  onAdd,
  custom,
  setCustom,
  resetPrices,
}) {
  const [cat, setCat] = useState(0);
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState(false);
  const [cn, setCn] = useState("");
  const [cp, setCp] = useState("");
  const q = query.trim().toLowerCase();
  const current = categories[Math.min(cat, categories.length - 1)];
  const list = q
    ? categories
        .flatMap((c) => c.items)
        .filter((i) => i.name.toLowerCase().includes(q))
    : current.items;

  const addCustom = () => {
    const p = parseFloat(cp);
    if (!cn.trim() || isNaN(p) || p < 0) return;
    setCustom([...custom, { id: "c" + Date.now(), name: cn.trim(), base: p }]);
    setCn("");
    setCp("");
  };

  return (
    <section>
      <h2>2. Меню</h2>
      <div className="bar">
        <input
          type="search"
          placeholder="Поиск блюда"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <label>
          <input
            type="checkbox"
            checked={edit}
            onChange={(e) => setEdit(e.target.checked)}
          />{" "}
          менять цены
        </label>
      </div>
      <div className="tabs">
        {categories.map((c, i) => (
          <button
            key={c.title}
            className={"tab" + (i === cat && !q ? " on" : "")}
            onClick={() => {
              setCat(i);
              setQuery("");
            }}
          >
            {c.title}
          </button>
        ))}
      </div>
      {list.length === 0 && <div className="empty">Ничего не найдено</div>}
      {list.map((i) => (
        <div className="row" key={i.id}>
          <span className="n">{i.name}</span>
          {edit ? (
            <PriceInput value={price(i)} onChange={(v) => setPrice(i.id, v)} />
          ) : (
            <span className="p">{fmt(price(i))} ₼</span>
          )}
          {edit && i.custom && (
            <button
              className="tiny danger"
              onClick={() => setCustom(custom.filter((c) => c.id !== i.id))}
            >
              ✕
            </button>
          )}
          <button
            className="add"
            aria-label={`Добавить ${i.name}`}
            onClick={() => onAdd(i)}
          >
            +
          </button>
        </div>
      ))}
      <div className="bar topline">
        <input
          placeholder="Своё блюдо"
          value={cn}
          onChange={(e) => setCn(e.target.value)}
          style={{ flex: 1, minWidth: 120 }}
        />
        <input
          type="number"
          step="0.05"
          min="0"
          placeholder="₼"
          className="pin"
          value={cp}
          onChange={(e) => setCp(e.target.value)}
        />
        <button onClick={addCustom}>Добавить</button>
      </div>
      <button
        className="tiny"
        onClick={() =>
          confirm("Сбросить все изменённые цены?") && resetPrices()
        }
      >
        Сбросить цены к исходным
      </button>
    </section>
  );
}

function Order({ mode, order, setOrder, table, sel, toast }) {
  const upd = (uid, patch) =>
    setOrder(order.map((o) => (o.uid === uid ? { ...o, ...patch } : o)));
  const change = (uid, d) =>
    setOrder(
      order
        .map((o) => (o.uid === uid ? { ...o, qty: o.qty + d } : o))
        .filter((o) => o.qty > 0),
    );
  const togglePerson = (o, n) =>
    upd(o.uid, {
      people: o.people.includes(n)
        ? o.people.filter((x) => x !== n)
        : [...o.people, n],
    });
  const toggleShared = (o) => {
    if (!o.shared) return upd(o.uid, { shared: true });
    upd(o.uid, { shared: false, people: sel.filter((n) => table.includes(n)) });
  };

  return (
    <section>
      <h2>3. Заказ</h2>
      {order.length === 0 && (
        <div className="empty">
          Пока пусто. Отметь, кто за столом, и добавь блюдо из меню.
        </div>
      )}
      {order.map((o) => (
        <div className="row wrap" key={o.uid}>
          <div className="n">
            {o.name} <span className="p">{fmt(o.price)}</span>
            {mode === "items" && o.shared && (
              <div className="who">Общее: поровну на всех ({table.length})</div>
            )}
            {mode === "items" && !o.shared && o.people.length === 0 && (
              <div className="warn">Выбери ниже, кто это ел</div>
            )}
          </div>
          {mode === "items" && (
            <label className="who share">
              <input
                type="checkbox"
                checked={!!o.shared}
                onChange={() => toggleShared(o)}
              />{" "}
              общее
            </label>
          )}
          <div className="q">
            <button onClick={() => change(o.uid, -1)}>−</button>
            <b>{o.qty}</b>
            <button onClick={() => change(o.uid, 1)}>+</button>
          </div>
          <button
            className="tiny danger"
            onClick={() => setOrder(order.filter((x) => x.uid !== o.uid))}
          >
            ✕
          </button>
          {mode === "items" && !o.shared && (
            <div className="mini">
              {table.map((n) => (
                <button
                  key={n}
                  className={o.people.includes(n) ? "on" : ""}
                  onClick={() => togglePerson(o, n)}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

function Summary({ mode, order, table, payer, setPayer, svc, setSvc, toast }) {
  const { detail, total, unassigned } = useMemo(() => {
    const k = 1 + svc / 100;
    const d = {};
    table.forEach((n) => (d[n] = { items: [], sum: 0 }));
    const sum = order.reduce((a, o) => a + o.price * o.qty, 0) * k;
    let un = 0;
    if (mode === "equal") {
      table.forEach((n) => (d[n].sum = sum / table.length));
    } else {
      order.forEach((o) => {
        const amt = o.price * o.qty * k;
        const who = o.shared ? table : o.people;
        if (!who.length) {
          un += amt;
          return;
        }
        who.forEach((p) => {
          d[p] = d[p] || { items: [], sum: 0 };
          const part = amt / who.length;
          d[p].sum += part;
          d[p].items.push({
            name: o.name,
            qty: o.qty,
            part,
            split: who.length,
            shared: o.shared,
          });
        });
      });
    }
    return { detail: d, total: sum, unassigned: un };
  }, [mode, order, table, svc]);

  const people = Object.keys(detail);
  const ready = people.length > 0 && order.length > 0;
  const line = (it) =>
    `${it.qty > 1 ? it.qty + "× " : ""}${it.name}${it.split > 1 ? (it.shared ? " (общее ÷" : " (÷") + it.split + ")" : ""}`;

  const copy = () => {
    const head =
      mode === "equal"
        ? `Beykoz, поровну на ${people.length} чел. Платил: ${payer}`
        : `Beykoz, каждый за своё. Платил: ${payer}`;
    const txt =
      head +
      "\n" +
      people
        .filter((n) => n !== payer)
        .map(
          (n) =>
            `${n} — ${fmt(detail[n].sum)} ₼` +
            (mode === "items" && detail[n].items.length
              ? ` (${detail[n].items.map(line).join(", ")})`
              : ""),
        )
        .join("\n") +
      `\nИтого: ${fmt(total)} ₼`;
    navigator.clipboard
      ?.writeText(txt)
      .then(() => toast("Скопировано"))
      .catch(() => prompt("Скопируй:", txt));
  };

  return (
    <section>
      <h2>4. Кто сколько должен</h2>
      <div className="bar">
        <label>
          Заплатил
          <select value={payer} onChange={(e) => setPayer(e.target.value)}>
            {NAMES.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          Сервис %
          <input
            type="number"
            min="0"
            step="1"
            className="pin"
            value={svc}
            onChange={(e) =>
              setSvc(Math.max(0, parseFloat(e.target.value) || 0))
            }
          />
        </label>
      </div>
      {!ready && (
        <div className="empty">
          Отметь, кто за столом, и добавь блюда, и здесь появится расчёт.
        </div>
      )}
      {ready &&
        people.map((n) => {
          const isPayer = n === payer;
          return (
            <div className="person" key={n}>
              <div className={"tot" + (isPayer ? " payer" : "")}>
                <span>
                  {n}
                  {isPayer && " (платил)"}
                </span>
                <span>
                  <b>{fmt(detail[n].sum)} ₼</b>
                  {!isPayer && ` → ${payer}`}
                </span>
              </div>
              {mode === "items" &&
                detail[n].items.map((it, i) => (
                  <div className="dish" key={i}>
                    <span>{line(it)}</span>
                    <span>{fmt(it.part)}</span>
                  </div>
                ))}
              {mode === "items" && detail[n].items.length === 0 && (
                <div className="dish">
                  <span>ничего не заказал</span>
                  <span>0.00</span>
                </div>
              )}
            </div>
          );
        })}
      {ready && mode === "items" && unassigned > 0.005 && (
        <div className="warn">
          Не распределено: {fmt(unassigned)} ₼. Назначь блюда в заказе выше.
        </div>
      )}
      {ready && (
        <>
          <div className="tot">
            <span>Общий счёт{svc > 0 && ` (с сервисом ${svc}%)`}</span>
            <span className="big">{fmt(total)} ₼</span>
          </div>
          <div className="bar topline">
            <button className="add" onClick={copy}>
              Скопировать расчёт
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default function App() {
  const [prices, setPrices] = useLocalStorage("beykoz-prices", {});
  const [custom, setCustom] = useLocalStorage("beykoz-custom", []);
  const [order, setOrder] = useLocalStorage("beykoz-order", []);
  const [table, setTable] = useLocalStorage("beykoz-table", []);
  const [sel, setSel] = useLocalStorage("beykoz-sel", []);
  const [payer, setPayer] = useLocalStorage("beykoz-payer", NAMES[0]);
  const [svc, setSvc] = useLocalStorage("beykoz-svc", 0);
  const [mode, setMode] = useLocalStorage("beykoz-mode", "items");
  const [msg, setMsg] = useState("");
  const timer = useRef();

  const toast = (m) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(""), 1400);
  };

  const categories = useMemo(() => {
    const c = [...MENU];
    if (custom.length)
      c.push({
        title: "Своё",
        items: custom.map((i) => ({ ...i, custom: true })),
      });
    return c;
  }, [custom]);

  const price = (i) => prices[i.id] ?? i.base;

  const addItem = (item) => {
    if (!table.length) return toast("Сначала отметь, кто за столом");
    const shared = mode === "items" && isShared(item.name);
    const people =
      mode === "items" && !shared ? sel.filter((n) => table.includes(n)) : [];
    const p = price(item);
    const key = shared ? "shared" : people.join();
    const ex = order.find(
      (o) =>
        o.itemId === item.id &&
        o.price === p &&
        (o.shared ? "shared" : o.people.join()) === key,
    );
    setOrder(
      ex
        ? order.map((o) => (o === ex ? { ...o, qty: o.qty + 1 } : o))
        : [
            ...order,
            {
              uid: Date.now() + Math.random(),
              itemId: item.id,
              name: item.name,
              price: p,
              qty: 1,
              people,
              shared,
            },
          ],
    );
    toast("+ " + item.name);
  };

  return (
    <div className="wrap">
      <header>
        <h1>Beykoz calculator</h1>
        <button
          className="tiny danger"
          onClick={() =>
            confirm("Очистить заказ и список за столом?") &&
            (setOrder([]), setSel([]), setTable([]))
          }
        >
          Новый счёт
        </button>
      </header>
      <ModeSwitch mode={mode} setMode={setMode} />
      <People
        mode={mode}
        table={table}
        setTable={setTable}
        sel={sel}
        setSel={setSel}
      />
      <Menu
        categories={categories}
        price={price}
        onAdd={addItem}
        custom={custom}
        setCustom={setCustom}
        setPrice={(id, v) => setPrices({ ...prices, [id]: v })}
        resetPrices={() => setPrices({})}
      />
      <Order
        mode={mode}
        order={order}
        setOrder={setOrder}
        table={table}
        sel={sel}
        toast={toast}
      />
      <Summary
        mode={mode}
        order={order}
        table={table}
        payer={payer}
        setPayer={setPayer}
        svc={svc}
        setSvc={setSvc}
        toast={toast}
      />
      <div className={"toast" + (msg ? " show" : "")}>{msg}</div>
    </div>
  );
}
