"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePatient, PatientRecord } from "../lib/patientStore";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function Input({ label, value, onChange, placeholder, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">
        {label}{required && <span className="text-critical-text ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:border-info-border transition-colors"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-info-border transition-colors"
      >
        {options.map((o) => <option key={o.value} value={o.value} className="bg-card">{o.label}</option>)}
      </select>
    </div>
  );
}

export default function NewPatientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("F");
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().slice(0, 10));
  const [losDays, setLosDays] = useState("");
  const [admissionType, setAdmissionType] = useState("Emergency");
  const [unit, setUnit] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    const id = generateId();
    const now = new Date().toISOString();
    const record: PatientRecord = {
      id,
      createdAt: now,
      updatedAt: now,
      basic: { name, age, sex, admissionDate, losDays, admissionType, unit, chiefComplaint },
      physician: null,
      nurse: null,
      pharmacist: null,
      msw: null,
      pt: null,
    };
    savePatient(record);
    router.push(`/intake/${id}`);
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <div className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">新規患者レコード</div>
        <h1 className="text-xl font-mono font-semibold text-text-primary">患者基本情報</h1>
        <p className="text-xs text-text-secondary mt-1">
          まず患者レコードを作成します。各職種はあとから担当セクションを入力できます。
        </p>
      </div>

      <div className="bg-panel border border-border-subtle rounded-sm p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="患者氏名" value={name} onChange={setName} placeholder="氏名" required />
          <Input label="年齢" value={age} onChange={setAge} placeholder="例: 72" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="性別" value={sex} onChange={setSex}
            options={[{value:"F",label:"女性"},{value:"M",label:"男性"},{value:"Other",label:"その他"}]} />
          <Input label="入院日" value={admissionDate} onChange={setAdmissionDate} type="date" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="入院日数" value={losDays} onChange={setLosDays} placeholder="例: 4" />
          <Select label="入院区分" value={admissionType} onChange={setAdmissionType}
            options={[{value:"Emergency",label:"救急"},{value:"Urgent",label:"緊急"},{value:"Elective",label:"予定"}]} />
        </div>
        <Input label="病棟 / 診療科" value={unit} onChange={setUnit} placeholder="例: 内科 / 循環器" />
        <div>
          <label className="block text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-1">
            主訴<span className="text-critical-text ml-1">*</span>
          </label>
          <textarea
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="入院理由を1〜2文で入力"
            rows={2}
            className="w-full bg-card border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:outline-none focus:border-info-border transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className={`w-full py-2.5 rounded-sm font-mono text-sm font-semibold transition-colors ${
            name.trim()
              ? "bg-accent text-white hover:bg-accent/80"
              : "bg-card text-text-tertiary border border-border-subtle cursor-not-allowed"
          }`}
        >
          患者レコードを作成 →
        </button>
      </div>

      <p className="text-2xs font-mono text-text-tertiary mt-3 text-center">
        作成後、各職種が担当評価を個別に入力できます。
      </p>
    </div>
  );
}
