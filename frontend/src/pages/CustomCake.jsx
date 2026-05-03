import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Cake,
  ChevronRight,
  Palette,
  MessageSquare,
  Calendar,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';
import {
  saveCustomCakeRequest,
  loadCustomCakeRequest,
  clearCustomCakeRequest,
} from '../utils/customCake';

const SHAPES = ['Round', 'Heart', 'Square', 'Tiered', 'Sheet', 'Designer'];
const WEIGHTS = ['0.5 kg', '1 kg', '1.5 kg', '2 kg', '2.5 kg', '3 kg', 'Custom'];
const SPONGES = ['Vanilla', 'Chocolate', 'Red velvet', 'Butterscotch', 'Black forest', 'Custom'];
const TOPPINGS = ['Fresh fruits', 'Chocolate ganache', 'Sprinkles', 'Nuts', 'Edible flowers', 'Macarons'];

const defaultForm = () => ({
  shape: '',
  tiers: '1',
  servingWeight: '',
  flavour: '',
  customFlavour: '',
  spongeType: '',
  eggless: true,
  frostingNote: '',
  designTheme: '',
  toppings: [],
  messageOnCake: '',
  candleRequired: true,
  knifeIncluded: true,
  lessSugar: false,
  preferredDate: '',
  extraNotes: '',
});

const CustomCake = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [picks, setPicks] = useState([]);

  useEffect(() => {
    const saved = loadCustomCakeRequest();
    if (saved && typeof saved === 'object') {
      setForm((f) => ({ ...f, ...saved }));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await productService.getAll({
          category: 'cakes',
          limit: 8,
          sort: '-ratingsAverage',
        });
        const list = res?.data?.data || [];
        if (!cancelled) setPicks(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setPicks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleTopping = (t) => {
    setForm((f) => ({
      ...f,
      toppings: f.toppings.includes(t)
        ? f.toppings.filter((x) => x !== t)
        : [...f.toppings, t],
    }));
  };

  const handleSaveAndShop = () => {
    saveCustomCakeRequest({ ...form, updatedAt: new Date().toISOString() });
    toast.success('Preferences saved — pick a cake and checkout');
    navigate('/shop?category=cakes');
  };

  const handleSaveOnly = () => {
    saveCustomCakeRequest({ ...form, updatedAt: new Date().toISOString() });
    toast.success('Custom cake details saved');
  };

  const handleClear = () => {
    clearCustomCakeRequest();
    setForm(defaultForm());
    toast('Form cleared');
  };

  const chipClass = (active) =>
    `px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide border-2 transition-all ${
      active
        ? 'border-primary bg-primary text-button-text shadow-md'
        : 'border-border bg-card-soft text-heading hover:border-primary/40'
    }`;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-12">
      <div className="bg-navbar text-navbar-text border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2 text-xs text-muted">
          <button type="button" onClick={() => navigate('/')} className="hover:text-primary">
            Home
          </button>
          <ChevronRight size={14} />
          <span className="font-bold text-foreground">Custom cake</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-secondary/[0.06]" />
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">
              <Sparkles size={14} />
              Made to order
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-heading tracking-tight leading-[1.1]">
              Design your{' '}
              <span className="text-primary">custom cake</span>
            </h1>
            <p className="mt-4 text-muted font-medium leading-relaxed text-sm sm:text-base">
              Tell us shape, flavour, message, and extras. We&apos;ll attach this to your order at
              checkout after you add a cake from the shop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleSaveAndShop}
                className="bg-primary text-button-text shadow-premium"
                icon={ShoppingBag}
              >
                Save & browse cakes
              </Button>
              <Button type="button" variant="outline" onClick={handleSaveOnly}>
                Save preferences only
              </Button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-muted hover:text-error transition-colors"
              >
                <Trash2 size={16} /> Clear
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Shape & size */}
        <section className="bg-card rounded-2xl border border-border/50 shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Cake size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-heading uppercase tracking-tight">
                Shape & size
              </h2>
              <p className="text-xs text-muted font-medium mt-0.5">
                Pick a base style — final price depends on product & weight.
              </p>
            </div>
          </div>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">Shape</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {SHAPES.map((s) => (
              <button
                key={s}
                type="button"
                className={chipClass(form.shape === s)}
                onClick={() => update({ shape: form.shape === s ? '' : s })}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">
                Tiers
              </label>
              <select
                className="input-field w-full"
                value={form.tiers}
                onChange={(e) => update({ tiers: e.target.value })}
              >
                {['1', '2', '3+'].map((t) => (
                  <option key={t} value={t}>
                    {t === '3+' ? '3 or more' : `${t} tier${t === '1' ? '' : 's'}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">
                Serving weight
              </label>
              <div className="flex flex-wrap gap-2">
                {WEIGHTS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={chipClass(form.servingWeight === w)}
                    onClick={() =>
                      update({ servingWeight: form.servingWeight === w ? '' : w })
                    }
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Flavour & sponge */}
        <section className="bg-card rounded-2xl border border-border/50 shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-secondary/15 text-secondary">
              <Palette size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-heading uppercase tracking-tight">
                Flavour & sponge
              </h2>
              <p className="text-xs text-muted font-medium mt-0.5">
                Choose presets or describe something unique.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">
                Flavour idea
              </label>
              <input
                className="input-field w-full"
                placeholder="e.g. Belgian chocolate"
                value={form.flavour}
                onChange={(e) => update({ flavour: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">
                Custom flavour notes
              </label>
              <input
                className="input-field w-full"
                placeholder="Allergies, combos…"
                value={form.customFlavour}
                onChange={(e) => update({ customFlavour: e.target.value })}
              />
            </div>
          </div>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-6 mb-3">
            Sponge base
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {SPONGES.map((s) => (
              <button
                key={s}
                type="button"
                className={chipClass(form.spongeType === s)}
                onClick={() =>
                  update({ spongeType: form.spongeType === s ? '' : s })
                }
              >
                {s}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.eggless}
              onChange={(e) => update({ eggless: e.target.checked })}
              className="rounded border-border w-4 h-4 accent-primary"
            />
            <span className="text-sm font-bold text-heading">Eggless sponge</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer mt-3">
            <input
              type="checkbox"
              checked={form.lessSugar}
              onChange={(e) => update({ lessSugar: e.target.checked })}
              className="rounded border-border w-4 h-4 accent-primary"
            />
            <span className="text-sm font-bold text-heading">Lighter / less sugar</span>
          </label>
        </section>

        {/* Design & toppings */}
        <section className="bg-card rounded-2xl border border-border/50 shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-accent/15 text-accent">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-heading uppercase tracking-tight">
                Frosting & toppings
              </h2>
            </div>
          </div>
          <input
            className="input-field w-full mb-4"
            placeholder="Frosting colour / buttercream style"
            value={form.frostingNote}
            onChange={(e) => update({ frostingNote: e.target.value })}
          />
          <input
            className="input-field w-full mb-6"
            placeholder="Theme (e.g. unicorn, minimal gold, kid superhero)"
            value={form.designTheme}
            onChange={(e) => update({ designTheme: e.target.value })}
          />
          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">
            Toppings (multi-select)
          </p>
          <div className="flex flex-wrap gap-2">
            {TOPPINGS.map((t) => (
              <button
                key={t}
                type="button"
                className={chipClass(form.toppings.includes(t))}
                onClick={() => toggleTopping(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Message & logistics */}
        <section className="bg-card rounded-2xl border border-border/50 shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-success-light text-success-text border border-success/15">
              <MessageSquare size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-heading uppercase tracking-tight">
                Message & extras
              </h2>
            </div>
          </div>
          <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">
            Message on cake (short)
          </label>
          <textarea
            className="input-field w-full min-h-[88px] resize-y mb-6"
            placeholder="Happy Birthday Ananya — Love, Mom"
            maxLength={120}
            value={form.messageOnCake}
            onChange={(e) => update({ messageOnCake: e.target.value })}
          />
          <div className="flex flex-wrap gap-6 mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.candleRequired}
                onChange={(e) => update({ candleRequired: e.target.checked })}
                className="rounded border-border w-4 h-4 accent-primary"
              />
              <span className="text-sm font-bold text-heading">Include candles</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.knifeIncluded}
                onChange={(e) => update({ knifeIncluded: e.target.checked })}
                className="rounded border-border w-4 h-4 accent-primary"
              />
              <span className="text-sm font-bold text-heading">Cake knife</span>
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest mb-2">
                <Calendar size={14} /> Preferred date (reference)
              </label>
              <input
                type="date"
                className="input-field w-full"
                value={form.preferredDate}
                onChange={(e) => update({ preferredDate: e.target.value })}
              />
              <p className="text-[10px] text-muted mt-1 font-medium">
                Final delivery date/time is confirmed at checkout.
              </p>
            </div>
            <div>
              <label className="text-[10px] font-black text-muted uppercase tracking-widest block mb-2">
                Anything else?
              </label>
              <textarea
                className="input-field w-full min-h-[88px]"
                placeholder="Pickup reference image links, dietary notes…"
                value={form.extraNotes}
                onChange={(e) => update({ extraNotes: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Popular cakes */}
        {picks.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-black text-heading uppercase tracking-tight">
                Popular cakes
              </h2>
              <Link
                to="/shop?category=cakes"
                className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {picks.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-8">
          <Button
            type="button"
            onClick={handleSaveAndShop}
            className="bg-primary text-button-text shadow-premium sm:min-w-[240px]"
            icon={ShoppingBag}
          >
            Save & browse cakes
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:min-w-[200px]"
            onClick={() => navigate('/cart')}
          >
            Go to cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomCake;
