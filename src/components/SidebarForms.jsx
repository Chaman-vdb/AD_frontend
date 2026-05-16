import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SCRIPT_FIELDS } from "./ScriptRunnerForm.jsx";
import { Select } from "./ui/Select.jsx";
import { sideInput, sideLabel, fadeIn } from "../constants.js";
import { fetchCompanyById, fetchCompanyNamesForIds, fetchOrgById, fetchUserById } from "../lib/entityLookup.js";

export function OrgForm({
  orgs,
  companies,
  selectedOrg,
  setSelectedOrg,
  selectedCompany,
  setSelectedCompany,
  orgDetails,
  companyDetails,
  newOrgName,
  setNewOrgName,
  newDomainUrl,
  setNewDomainUrl,
  newCompanyName,
  setNewCompanyName,
  disabled,
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex-1 min-w-0">
          <label className={sideLabel}>Organization</label>
          <Select
            value={selectedOrg || ""}
            onChange={(e) => setSelectedOrg(e.target.value || null)}
            className="w-full"
            searchable
            searchPlaceholder="Search orgs..."
            disabled={disabled}
          >
            <option value="">Select org...</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} (#{o.id})
              </option>
            ))}
          </Select>
        </div>
        {selectedOrg && (
          <div className="flex-1 min-w-0">
            <label className={sideLabel}>
              Company <span className="text-slate-400 normal-case">(opt)</span>
            </label>
            <Select
              value={selectedCompany || ""}
              onChange={(e) => setSelectedCompany(e.target.value || null)}
              className="w-full"
              disabled={disabled}
            >
              <option value="">None</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} #{c.id}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
      {orgDetails && (
        <motion.div {...fadeIn} className="space-y-2 pt-1">
          <div className="h-px bg-slate-100" />
          <div>
            <label className={sideLabel}>New Org Name</label>
            <input
              className={sideInput}
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              onBlur={(e) => setNewOrgName(e.target.value.trim())}
              placeholder="New org name..."
              disabled={disabled}
            />
          </div>
          <div>
            <label className={sideLabel}>Domain URL</label>
            <input
              className={sideInput}
              value={newDomainUrl}
              onChange={(e) => setNewDomainUrl(e.target.value)}
              onBlur={(e) => setNewDomainUrl(e.target.value.trim())}
              placeholder="Domain..."
              disabled={disabled}
            />
          </div>
          {companyDetails && (
            <div>
              <label className={sideLabel}>New Company Name</label>
              <input
                className={sideInput}
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                onBlur={(e) => setNewCompanyName(e.target.value.trim())}
                placeholder="Company name..."
                disabled={disabled}
              />
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}

export function CompanyForm({
  orgs,
  ccSourceOrg,
  setCcSourceOrg,
  ccCompanies,
  ccSelectedCompany,
  setCcSelectedCompany,
  ccDestOrg,
  setCcDestOrg,
  ccNewName,
  setCcNewName,
  disabled,
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex-1 min-w-0">
          <label className={sideLabel}>Source Org</label>
          <Select
            value={ccSourceOrg}
            onChange={(e) => setCcSourceOrg(e.target.value)}
            className="w-full"
            searchable
            searchPlaceholder="Search..."
            disabled={disabled}
          >
            <option value="">Select...</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} (#{o.id})
              </option>
            ))}
          </Select>
        </div>
        {ccSourceOrg && (
          <div className="flex-1 min-w-0">
            <label className={sideLabel}>Source Company</label>
            <Select
              value={ccSelectedCompany}
              onChange={(e) => setCcSelectedCompany(e.target.value)}
              className="w-full"
              disabled={disabled}
            >
              <option value="">Select...</option>
              {ccCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} #{c.id}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
      {ccSelectedCompany && (
        <motion.div {...fadeIn} className="space-y-2">
          <div>
            <label className={sideLabel}>Destination Org</label>
            <Select
              value={ccDestOrg}
              onChange={(e) => setCcDestOrg(e.target.value)}
              className="w-full"
              searchable
              searchPlaceholder="Search..."
              disabled={disabled}
            >
              <option value="">Select dest org...</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} (#{o.id})
                </option>
              ))}
            </Select>
          </div>
          {ccDestOrg && (
            <div>
              <label className={sideLabel}>New Company Name</label>
              <input
                className={sideInput}
                value={ccNewName}
                onChange={(e) => setCcNewName(e.target.value)}
                onBlur={(e) => setCcNewName(e.target.value.trim())}
                placeholder="Company name..."
                disabled={disabled}
              />
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}

export function BulkUsersSheetForm({
  bulkUserFile,
  setBulkUserFile,
  bulkUserSheetName,
  setBulkUserSheetName,
  disabled,
  onValidateOnly,
  validating,
  hasValidatedPayload,
  validationUsernames,
  verifyEmailAfterCreate,
  setVerifyEmailAfterCreate,
  lastCreatedUsersCsv,
  onDownloadCsv,
}) {
  const fileInputRef = useRef(null);
  return (
    <>
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
        <p className="text-[11px] text-emerald-800 leading-relaxed">
          Upload <strong>.xlsx, .xls, or .csv</strong>. <strong>Required:</strong> org (or organization_id), company
          (company_id), username, password. <strong>Optional:</strong> name, lastname, email, country, city, state,
          visibility — omitted fields use the same defaults as single-user HTTP (
          <code className="text-[10px]">test</code> / <code className="text-[10px]">user</code> /{' '}
          <code className="text-[10px]">India</code> / <code className="text-[10px]">Agar</code> or{' '}
          <code className="text-[10px]">SINGLE_USER_HTTP_*</code> env).
        </p>
      </div>
      <div>
        <label className={sideLabel}>Spreadsheet (.xlsx / .xls / .csv)</label>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setBulkUserFile(f);
            }}
          />
          <button
            type="button"
            className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-left text-[11px] text-slate-700 hover:bg-slate-50 disabled:opacity-50 truncate"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            {bulkUserFile ? bulkUserFile.name : "Choose file…"}
          </button>
          {bulkUserFile && (
            <button
              type="button"
              className="h-8 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              disabled={disabled}
              onClick={() => {
                setBulkUserFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <label className={sideLabel}>
            Sheet name{" "}
            <span className="text-slate-400 normal-case">(optional)</span>
          </label>
          <a
            href="https://docs.google.com/spreadsheets/d/1P-WoGLs6bKYcqKS4JGtm5NCt-7bm05aEYh6cpTHvjtQ/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-semibold text-blue-400 hover:text-blue-600"
          >
            Sample sheet
          </a>
        </div>
        <input
          className={sideInput}
          value={bulkUserSheetName}
          onChange={(e) => setBulkUserSheetName(e.target.value)}
          onBlur={(e) => setBulkUserSheetName(e.target.value.trim())}
          placeholder="First sheet if empty"
          disabled={disabled}
        />
      </div>
      {hasValidatedPayload && (
        <p className="text-[10px] font-semibold text-emerald-700">
          Validated — Start will POST JSON (faster) using parsed rows.
        </p>
      )}
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          className="mt-0.5 size-3.5 text-emerald-600 focus:ring-emerald-500"
          checked={verifyEmailAfterCreate}
          onChange={(e) => setVerifyEmailAfterCreate(e.target.checked)}
          disabled={disabled}
        />
        <span className="text-[10px] leading-snug text-slate-700">
          <span className="font-semibold text-slate-900">Verify email after create</span>
         
        </span>
      </label>
      <button
        type="button"
        className="w-full h-8 rounded-lg border border-emerald-300 bg-emerald-50 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
        disabled={disabled || validating || !bulkUserFile}
        onClick={onValidateOnly}
      >
        {validating ? "Validating…" : "Validate sheet (parse + DB checks)"}
      </button>
      {validationUsernames &&
        (validationUsernames.dbUsernameConflicts?.length > 0 ||
          validationUsernames.internalDuplicates?.length > 0) && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-2.5 py-2">
            <p className="text-[10px] font-bold text-amber-900">
              Username checks
            </p>
            <ul className="mt-1.5 space-y-1 text-[10px] leading-snug text-amber-950">
              {(validationUsernames.dbUsernameConflicts || []).map((c, i) => (
                <li key={`db-${i}`}>
                  Row{" "}
                  <span className="font-semibold tabular-nums">
                    {c.sheetRow}
                  </span>
                  :{" "}
                  <code className="rounded bg-amber-100/90 px-0.5 text-[9px]">
                    {c.username}
                  </code>{" "}
                  already exists
                  <span className="text-amber-800/90">
                    {" "}
                    (user id{" "}
                    <span className="font-semibold tabular-nums">
                      {c.existingUserId ?? "—"}
                    </span>
                    , company{" "}
                    <span className="font-semibold tabular-nums">
                      {c.existingCompanyId ?? "—"}
                    </span>
                    )
                  </span>
                </li>
              ))}
              {(validationUsernames.internalDuplicates || []).map((d, i) => (
                <li key={`dup-${i}`}>
                  Row{" "}
                  <span className="font-semibold tabular-nums">
                    {d.sheetRow}
                  </span>
                  :{" "}
                  <code className="rounded bg-amber-100/90 px-0.5 text-[9px]">
                    {d.username}
                  </code>{" "}
                  duplicate in sheet
                  {d.duplicateOfSheetRow != null && (
                    <span className="text-amber-800/90">
                      {" "}
                      (same as row {d.duplicateOfSheetRow})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      {lastCreatedUsersCsv && (
        <button
          type="button"
          className="w-full h-8 rounded-lg border border-slate-300 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          disabled={disabled}
          onClick={onDownloadCsv}
        >
          Download created users (CSV)
        </button>
      )}
      <p className="text-[10px] text-slate-400">
        <code className="text-slate-500">/api/bulk-users/parse</code> →{" "}
        <code className="text-slate-500">/api/bulk-users/run</code> (multipart
        or JSON + resume after username conflict).
      </p>
    </>
  );
}

export function UserForm({
  cuBaseUrl,
  setCuBaseUrl,
  cuEmail,
  setCuEmail,
  cuPassword,
  setCuPassword,
  cuCompanyId,
  setCuCompanyId,
  cuName,
  setCuName,
  cuCount,
  setCuCount,
  disabled,
}) {
  const [companyHint, setCompanyHint] = useState(null);
  const [companyHintLoading, setCompanyHintLoading] = useState(false);
  /** 'idle' | 'ok' | 'missing' — avoids flashing “not found” before lookup */
  const [companyResolveStatus, setCompanyResolveStatus] = useState("idle");

  const onCompanyIdBlur = async () => {
    const v = String(cuCompanyId || "").trim();
    if (!/^\d+$/.test(v)) {
      setCompanyHint(null);
      setCompanyResolveStatus("idle");
      return;
    }
    setCompanyHintLoading(true);
    setCompanyResolveStatus("idle");
    const name = await fetchCompanyById(v);
    setCompanyHintLoading(false);
    setCompanyHint(name);
    setCompanyResolveStatus(name ? "ok" : "missing");
  };

  return (
    <>
      <div>
        <label className={sideLabel}>Base URL</label>
        <input
          className={sideInput}
          value={cuBaseUrl}
          onChange={(e) => setCuBaseUrl(e.target.value)}
          onBlur={(e) => setCuBaseUrl(e.target.value.trim())}
          placeholder="https://example.customvirtual.app"
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex-1">
          <label className={sideLabel}>Email</label>
          <input
            className={sideInput}
            type="email"
            value={cuEmail}
            onChange={(e) => setCuEmail(e.target.value)}
            onBlur={(e) => setCuEmail(e.target.value.trim())}
            placeholder="admin@example.com"
            disabled={disabled}
          />
        </div>
        <div className="flex-1">
          <label className={sideLabel}>Password</label>
          <input
            className={sideInput}
            type="password"
            value={cuPassword}
            onChange={(e) => setCuPassword(e.target.value)}
            onBlur={(e) => setCuPassword(e.target.value.trim())}
            placeholder="********"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex-1">
          <label className={sideLabel}>Company ID</label>
          <input
            className={sideInput}
            value={cuCompanyId}
            onChange={(e) => {
              setCuCompanyId(e.target.value);
              setCompanyHint(null);
              setCompanyResolveStatus("idle");
            }}
            onBlur={(e) => {
              setCuCompanyId(e.target.value.trim());
              onCompanyIdBlur();
            }}
            placeholder="e.g. 204542"
            disabled={disabled}
          />
          {companyHintLoading && (
            <p className="mt-1 text-[10px] text-slate-400">Looking up company…</p>
          )}
          {!companyHintLoading && companyResolveStatus === "ok" && companyHint && (
            <p className="mt-1 text-[10px] font-semibold text-emerald-800">
              → {companyHint}
            </p>
          )}
          {!companyHintLoading && companyResolveStatus === "missing" && (
            <p className="mt-1 text-[10px] text-amber-700">
              No company found for this ID (check the number or DB connection).
            </p>
          )}
        </div>
        <div className="flex-1">
          <label className={sideLabel}>Name Prefix</label>
          <input
            className={sideInput}
            value={cuName}
            onChange={(e) => setCuName(e.target.value)}
            onBlur={(e) => setCuName(e.target.value.trim())}
            placeholder="e.g. Automation"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="w-1/2">
        <label className={sideLabel}>Users Count</label>
        <input
          className={sideInput}
          type="number"
          min={1}
          max={50}
          value={cuCount}
          onChange={(e) => setCuCount(e.target.value)}
          disabled={disabled}
        />
      </div>
    </>
  );
}

export function ServerAdminForm({
  saEmail,
  setSaEmail,
  saOrgId,
  setSaOrgId,
  saCompanyId,
  setSaCompanyId,
  saPassword,
  setSaPassword,
  disabled,
}) {
  const [orgHint, setOrgHint] = useState(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [companyHint, setCompanyHint] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  const onOrgBlur = async () => {
    const v = String(saOrgId || "").trim();
    if (!/^\d+$/.test(v)) {
      setOrgHint(null);
      return;
    }
    setOrgLoading(true);
    const name = await fetchOrgById(v);
    setOrgLoading(false);
    setOrgHint(name);
  };

  const onCompanyBlur = async () => {
    const v = String(saCompanyId || "").trim();
    if (!/^\d+$/.test(v)) {
      setCompanyHint(null);
      return;
    }
    setCompanyLoading(true);
    const name = await fetchCompanyById(v);
    setCompanyLoading(false);
    setCompanyHint(name);
  };

  return (
    <form
      className="contents"
      autoComplete="off"
      onSubmit={(e) => e.preventDefault()}
      data-vdb-form="server-admin"
    >
      <div className="rounded-lg border border-violet-200 bg-violet-50/90 px-3 py-2">
        <p className="text-[11px] text-violet-900 leading-relaxed">
          Creates an <strong>Admin user</strong> via the same form POST as the superadmin UI (
          <code className="text-[10px]">/superadmin/admin_users</code>
          ). Uses <strong>STAGE_BASE_URL</strong> and superadmin credentials from the server{" "}
          <code className="text-[10px]">.env</code>.
        </p>
      </div>
      <div>
        <label className={sideLabel} htmlFor="vdb-sa-email">
          Email
        </label>
        <input
          id="vdb-sa-email"
          name="vdb_server_admin_email"
          className={sideInput}
          type="email"
          autoComplete="email"
          value={saEmail}
          onChange={(e) => setSaEmail(e.target.value)}
          onBlur={(e) => setSaEmail(e.target.value.trim())}
          placeholder="admin@example.com"
          disabled={disabled}
        />
      </div>
      <div>
        <label className={sideLabel} htmlFor="vdb-sa-org-id">
          Organization ID
        </label>
        <input
          id="vdb-sa-org-id"
          name="vdb_server_admin_organization_id"
          className={sideInput}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={saOrgId}
          onChange={(e) => {
            setSaOrgId(e.target.value);
            setOrgHint(null);
          }}
          onBlur={(e) => {
            setSaOrgId(e.target.value.trim());
            onOrgBlur();
          }}
          placeholder="e.g. 1"
          disabled={disabled}
        />
        {orgLoading && (
          <p className="mt-1 text-[10px] text-slate-400">Looking up org…</p>
        )}
        {!orgLoading && orgHint && (
          <p className="mt-1 text-[10px] font-semibold text-emerald-800">→ {orgHint}</p>
        )}
      </div>
      <div>
        <label className={sideLabel} htmlFor="vdb-sa-company-id">
          Company ID
        </label>
        <input
          id="vdb-sa-company-id"
          name="vdb_server_admin_company_id"
          className={sideInput}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={saCompanyId}
          onChange={(e) => {
            setSaCompanyId(e.target.value);
            setCompanyHint(null);
          }}
          onBlur={(e) => {
            setSaCompanyId(e.target.value.trim());
            onCompanyBlur();
          }}
          placeholder="e.g. 91140"
          disabled={disabled}
        />
        {companyLoading && (
          <p className="mt-1 text-[10px] text-slate-400">Looking up company…</p>
        )}
        {!companyLoading && companyHint && (
          <p className="mt-1 text-[10px] font-semibold text-emerald-800">→ {companyHint}</p>
        )}
      </div>
      <div>
        <label className={sideLabel} htmlFor="vdb-sa-password">
          Password
        </label>
        <input
          id="vdb-sa-password"
          name="vdb_server_admin_password"
          className={sideInput}
          type="password"
          autoComplete="new-password"
          value={saPassword}
          onChange={(e) => setSaPassword(e.target.value)}
          onBlur={(e) => setSaPassword(e.target.value.trim())}
          placeholder="Initial password (confirmation matches)"
          disabled={disabled}
        />
        <p className="mt-1 text-[10px] text-slate-500">
          Role defaults to <code className="text-slate-600">contributor</code> (override with{" "}
          <code className="text-slate-600">SERVER_ADMIN_ROLE</code> on the server if needed).
        </p>
      </div>
    </form>
  );
}

export function SingleUserHttpForm({
  suhUsername,
  setSuhUsername,
  suhEmail,
  setSuhEmail,
  suhOrgId,
  setSuhOrgId,
  suhCompanyId,
  setSuhCompanyId,
  suhPassword,
  setSuhPassword,
  suhVerifyEmailAfterCreate,
  setSuhVerifyEmailAfterCreate,
  disabled,
}) {
  const [orgHint, setOrgHint] = useState(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [companyHint, setCompanyHint] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  const onOrgBlur = async () => {
    const v = String(suhOrgId || "").trim();
    if (!/^\d+$/.test(v)) {
      setOrgHint(null);
      return;
    }
    setOrgLoading(true);
    const name = await fetchOrgById(v);
    setOrgLoading(false);
    setOrgHint(name);
  };

  const onCompanyBlur = async () => {
    const v = String(suhCompanyId || "").trim();
    if (!/^\d+$/.test(v)) {
      setCompanyHint(null);
      return;
    }
    setCompanyLoading(true);
    const name = await fetchCompanyById(v);
    setCompanyLoading(false);
    setCompanyHint(name);
  };

  return (
    <>
      <div className="rounded-lg border border-sky-200 bg-sky-50/90 px-3 py-2">
        <p className="text-[11px] text-sky-900 leading-relaxed">
          One <strong>end user</strong> via{" "}
          <code className="text-[10px]">POST /superadmin/users</code> (same as superadmin “New user”). Uses{" "}
          <code className="text-[10px]">STAGE_BASE_URL</code> and superadmin credentials from the server{" "}
          <code className="text-[10px]">.env</code>. If you omit optional API fields, the server fills the same defaults as a
          typical superadmin create: first name <strong>test</strong>, last name <strong>user</strong>, country{" "}
          <strong>India</strong>, city <strong>Agar</strong> (override with{" "}
          <code className="text-[10px]">SINGLE_USER_HTTP_FIRST_NAME</code>,{" "}
          <code className="text-[10px]">SINGLE_USER_HTTP_LAST_NAME</code>,{" "}
          <code className="text-[10px]">SINGLE_USER_HTTP_COUNTRY</code>, <code className="text-[10px]">SINGLE_USER_HTTP_CITY</code>
          , <code className="text-[10px]">SINGLE_USER_HTTP_STATE</code>).
        </p>
      </div>
      <div>
        <label className={sideLabel}>Username</label>
        <input
          className={sideInput}
          value={suhUsername}
          onChange={(e) => setSuhUsername(e.target.value)}
          onBlur={(e) => setSuhUsername(e.target.value.trim())}
          placeholder="Unique login / username"
          disabled={disabled}
        />
      </div>
      <div>
        <label className={sideLabel}>Email</label>
        <input
          className={sideInput}
          type="email"
          value={suhEmail}
          onChange={(e) => setSuhEmail(e.target.value)}
          onBlur={(e) => setSuhEmail(e.target.value.trim())}
          placeholder="user@example.com"
          disabled={disabled}
        />
      </div>
      <div>
        <label className={sideLabel}>Organization ID</label>
        <input
          className={sideInput}
          value={suhOrgId}
          onChange={(e) => {
            setSuhOrgId(e.target.value);
            setOrgHint(null);
          }}
          onBlur={(e) => {
            setSuhOrgId(e.target.value.trim());
            onOrgBlur();
          }}
          placeholder="e.g. 1"
          disabled={disabled}
        />
        {orgLoading && (
          <p className="mt-1 text-[10px] text-slate-400">Looking up org…</p>
        )}
        {!orgLoading && orgHint && (
          <p className="mt-1 text-[10px] font-semibold text-emerald-800">→ {orgHint}</p>
        )}
      </div>
      <div>
        <label className={sideLabel}>Company ID</label>
        <input
          className={sideInput}
          value={suhCompanyId}
          onChange={(e) => {
            setSuhCompanyId(e.target.value);
            setCompanyHint(null);
          }}
          onBlur={(e) => {
            setSuhCompanyId(e.target.value.trim());
            onCompanyBlur();
          }}
          placeholder="e.g. 91140"
          disabled={disabled}
        />
        {companyLoading && (
          <p className="mt-1 text-[10px] text-slate-400">Looking up company…</p>
        )}
        {!companyLoading && companyHint && (
          <p className="mt-1 text-[10px] font-semibold text-emerald-800">→ {companyHint}</p>
        )}
      </div>
      <div>
        <label className={sideLabel}>Password</label>
        <input
          className={sideInput}
          type="password"
          value={suhPassword}
          onChange={(e) => setSuhPassword(e.target.value)}
          onBlur={(e) => setSuhPassword(e.target.value.trim())}
          placeholder="Initial password"
          disabled={disabled}
        />
      </div>
      <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
        <input
          type="checkbox"
          className="mt-0.5 rounded border-slate-300"
          checked={!!suhVerifyEmailAfterCreate}
          onChange={(e) => setSuhVerifyEmailAfterCreate(e.target.checked)}
          disabled={disabled}
        />
        <span className="text-[11px] text-slate-700 leading-snug">
          <span className="font-semibold text-slate-800">Mark email verified</span> after create — looks up{" "}
          <code className="text-[10px] text-slate-600">users.id</code> by email + company, then{" "}
          <code className="text-[10px] text-slate-600">PATCH</code> superadmin edit (same as bulk users: scraped form +{" "}
          <code className="text-[10px] text-slate-600">user[confirmed?]</code>).
        </span>
      </label>
    </>
  );
}

export function InventoryPermissionForm({
  ipClientCompanyId,
  setIpClientCompanyId,
  ipVendorCompanyIds,
  setIpVendorCompanyIds,
  ipCreateApiClient,
  setIpCreateApiClient,
  ipProducts,
  setIpProducts,
  disabled,
}) {
  const [clientHint, setClientHint] = useState(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientStatus, setClientStatus] = useState("idle");
  const [vendorRows, setVendorRows] = useState(null);
  const [vendorLoading, setVendorLoading] = useState(false);

  const productDefs = [
    { key: "diamond", label: "Diamond" },
    { key: "gemstone", label: "Gemstone" },
    { key: "jewelry", label: "Jewelry" },
    { key: "labgrown_diamond", label: "Labgrown Diamond" },
  ];

  const toggleProduct = (key) => {
    setIpProducts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onClientBlur = async () => {
    const v = String(ipClientCompanyId || "").trim();
    if (!/^\d+$/.test(v)) {
      setClientHint(null);
      setClientStatus("idle");
      return;
    }
    setClientLoading(true);
    setClientStatus("idle");
    const name = await fetchCompanyById(v);
    setClientLoading(false);
    setClientHint(name);
    setClientStatus(name ? "ok" : "missing");
  };

  const onVendorsBlur = async () => {
    const raw = String(ipVendorCompanyIds || "").trim();
    const ids = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d+$/.test(s));
    if (ids.length === 0) {
      setVendorRows(null);
      return;
    }
    setVendorLoading(true);
    const rows = await fetchCompanyNamesForIds(raw);
    setVendorLoading(false);
    setVendorRows(rows);
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
        <label className="text-[12px] font-semibold text-slate-700">
          Create API Client
        </label>
        <input
          type="checkbox"
          checked={ipCreateApiClient}
          onChange={(e) => setIpCreateApiClient(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
        />
      </div>

      <div>
        <label className={sideLabel}>Client company ID</label>
        <input
          className={sideInput}
          value={ipClientCompanyId}
          onChange={(e) => {
            setIpClientCompanyId(e.target.value);
            setClientHint(null);
            setClientStatus("idle");
          }}
          onBlur={(e) => {
            setIpClientCompanyId(e.target.value.trim());
            onClientBlur();
          }}
          placeholder="e.g. 204542"
          disabled={disabled}
        />
        {clientLoading && (
          <p className="mt-1 text-[10px] text-slate-400">Looking up client…</p>
        )}
        {!clientLoading && clientStatus === "ok" && clientHint && (
          <p className="mt-1 text-[10px] font-semibold text-emerald-800">
            → {clientHint}
          </p>
        )}
        {!clientLoading && clientStatus === "missing" && (
          <p className="mt-1 text-[10px] text-amber-700">
            No company found for this client ID.
          </p>
        )}
      </div>

      <div>
        <label className={sideLabel}>Vendor company ID(s)</label>
        <input
          className={sideInput}
          value={ipVendorCompanyIds}
          onChange={(e) => {
            setIpVendorCompanyIds(e.target.value);
            setVendorRows(null);
          }}
          onBlur={(e) => {
            setIpVendorCompanyIds(e.target.value.trim());
            onVendorsBlur();
          }}
          placeholder="e.g. 39416, 91268"
          disabled={disabled}
        />
        <p className="mt-1 text-[10px] text-slate-400">
          Comma-separated vendor company IDs for multi-vendor inventory.
        </p>
        {vendorLoading && (
          <p className="mt-1 text-[10px] text-slate-400">Looking up vendors…</p>
        )}
        {!vendorLoading && vendorRows && vendorRows.length > 0 && (
          <ul className="mt-1.5 space-y-0.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-1.5">
            {vendorRows.map((row) => (
              <li key={row.id} className="text-[10px] text-slate-700">
                <span className="font-mono tabular-nums text-slate-500">#{row.id}</span>
                {row.name ? (
                  <span className="ml-1.5 font-semibold text-emerald-900">→ {row.name}</span>
                ) : (
                  <span className="ml-1.5 text-amber-700">(not found)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className={sideLabel}>Product Permissions</label>
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-2">
          {productDefs.map((product) => (
            <label
              key={product.key}
              className="flex items-center gap-2 text-[12px] text-slate-700"
            >
              <input
                type="checkbox"
                checked={!!ipProducts[product.key]}
                onChange={() => toggleProduct(product.key)}
                disabled={disabled}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              {product.label}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

export function ScriptForm({ mode, scriptValues, setScriptValues, disabled }) {
  const sheetFileInputRef = useRef(null);
  const nav_id = mode;
  const scriptKey = nav_id
    .replace("script-copy-search-menus", "copyCustomSearchMenus")
    .replace("script-copy-white-label", "copyOrgWhiteLabel")
    .replace("script-copy-customizations", "copyCustomizations")
    .replace("script-copy-custom-data", "copyCustomDataAndValues")
    .replace("script-test-features", "testFeatureActivation")
    .replace("script-test-customizations", "testCustomizations")
    .replace(
      "script-import-search-menus-sheet",
      "importCustomSearchMenusFromSheet",
    );

  const cfg = SCRIPT_FIELDS[scriptKey];
  if (!cfg) return null;

  const currentScope = scriptValues._scope || "org";
  const sourceScope = scriptValues._sourceScope || "org";
  const targetScope = scriptValues._targetScope || "org";
  const customizationSourceScope = scriptValues._customizationSourceScope || "org";
  const customizationTargetScope = scriptValues._customizationTargetScope || "org";
  const activeFields = cfg.customizationEntityScopes
    ? [
        {
          key: "sourceId",
          label:
            customizationSourceScope === "company"
              ? "Source Company ID"
              : customizationSourceScope === "user"
                ? "Source User ID"
                : "Source Org ID",
          placeholder:
            customizationSourceScope === "company"
              ? "e.g. 39416"
              : customizationSourceScope === "user"
                ? "e.g. 120883"
                : "e.g. 832",
        },
        {
          key: "targetId",
          label:
            customizationTargetScope === "company"
              ? "Target Company ID"
              : customizationTargetScope === "user"
                ? "Target User ID"
                : "Target Org ID",
          placeholder:
            customizationTargetScope === "company"
              ? "e.g. 91268"
              : customizationTargetScope === "user"
                ? "e.g. 120884"
                : "e.g. 945",
        },
      ]
    : cfg.dualScopeSelector
      ? [
          {
            key: "sourceId",
            label:
              sourceScope === "company" ? "Source Company ID" : "Source Org ID",
            placeholder: sourceScope === "company" ? "e.g. 39416" : "e.g. 500",
          },
          {
            key: "targetId",
            label:
              targetScope === "company" ? "Target Company ID" : "Target Org ID",
            placeholder: targetScope === "company" ? "e.g. 91549" : "e.g. 945",
          },
        ]
      : cfg.scopeSelector
        ? cfg.fieldsByScope?.[currentScope] || cfg.fields
        : cfg.fields;
  const customizationTypeOptions = [
    { value: "global", label: "Global", defaultSelected: true },
    { value: "custom_texts", label: "Custom Texts", defaultSelected: true },
    {
      value: "json_navigation_menu",
      label: "JsonNavigationMenu",
      defaultSelected: true,
    },
    { value: "pdp", label: "PDP", defaultSelected: false },
    { value: "search_form", label: "Search form", defaultSelected: false },
    { value: "search_result", label: "Search result", defaultSelected: false },
    {
      value: "product_unified_page",
      label: "Product unified page",
      defaultSelected: false,
    },
  ];
  const defaultCustomizationTypeValues = customizationTypeOptions
    .filter((opt) => opt.defaultSelected)
    .map((opt) => opt.value);
  const selectedCustomizationTypes = Array.isArray(
    scriptValues._customizationTypes,
  )
    ? scriptValues._customizationTypes
    : defaultCustomizationTypeValues;
  const toggleCustomizationType = (typeValue) => {
    setScriptValues((prev) => {
      const current = Array.isArray(prev._customizationTypes)
        ? prev._customizationTypes
        : defaultCustomizationTypeValues;
      const exists = current.includes(typeValue);
      return {
        ...prev,
        _customizationTypes: exists
          ? current.filter((item) => item !== typeValue)
          : [...current, typeValue],
      };
    });
  };
  const customDataSectionOptions = [
    { value: "headers", label: "Custom Data Headers" },
    { value: "values", label: "Custom Data Values" },
  ];
  const selectedCustomDataSections = Array.isArray(
    scriptValues._customDataSections,
  )
    ? scriptValues._customDataSections
    : customDataSectionOptions.map((opt) => opt.value);
  const toggleCustomDataSection = (sectionValue) => {
    setScriptValues((prev) => {
      const current = Array.isArray(prev._customDataSections)
        ? prev._customDataSections
        : customDataSectionOptions.map((opt) => opt.value);
      const exists = current.includes(sectionValue);
      return {
        ...prev,
        _customDataSections: exists
          ? current.filter((item) => item !== sectionValue)
          : [...current, sectionValue],
      };
    });
  };

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () =>
        reject(reader.error || new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const [idHints, setIdHints] = useState({});

  useEffect(() => {
    setIdHints({});
  }, [
    scriptKey,
    sourceScope,
    targetScope,
    currentScope,
    customizationSourceScope,
    customizationTargetScope,
  ]);

  const fieldIsResolvableId = (f) => {
    if (scriptKey === "importCustomSearchMenusFromSheet") {
      if (f.key === "xlsxPath" || f.key === "sheetName") return false;
    }
    return true;
  };

  const resolveFieldHint = async (f, trimmed) => {
    if (!fieldIsResolvableId(f)) return;
    if (!/^\d+$/.test(trimmed)) {
      setIdHints((h) => ({ ...h, [f.key]: null }));
      return;
    }
    let kind = "org";
    if (scriptKey === "copyCustomSearchMenus") {
      if (f.key === "sourceId") kind = sourceScope === "company" ? "company" : "org";
      else if (f.key === "targetId") kind = targetScope === "company" ? "company" : "org";
    } else if (scriptKey === "copyCustomizations") {
      if (f.key === "sourceId") {
        kind =
          customizationSourceScope === "company"
            ? "company"
            : customizationSourceScope === "user"
              ? "user"
              : "org";
      } else if (f.key === "targetId") {
        kind =
          customizationTargetScope === "company"
            ? "company"
            : customizationTargetScope === "user"
              ? "user"
              : "org";
      } else {
        kind = "org";
      }
    } else if (scriptKey === "copyOrgWhiteLabel" || scriptKey === "testCustomizations") {
      kind = "org";
    } else if (scriptKey === "copyCustomDataAndValues" || scriptKey === "testFeatureActivation") {
      kind = "company";
    } else if (scriptKey === "importCustomSearchMenusFromSheet" && f.key === "targetOrgId") {
      kind = "org";
    }
    setIdHints((h) => ({ ...h, [f.key]: { loading: true } }));
    const name =
      kind === "org"
        ? await fetchOrgById(trimmed)
        : kind === "user"
          ? await fetchUserById(trimmed)
          : await fetchCompanyById(trimmed);
    setIdHints((h) => ({
      ...h,
      [f.key]: { loading: false, name: name || null },
    }));
  };

  return (
    <>
      {cfg.customizationEntityScopes && (
        <>
          <div>
            <label className={sideLabel}>Source entity</label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  !disabled &&
                  setScriptValues((p) => ({ ...p, _customizationSourceScope: "org" }))
                }
                disabled={disabled}
                className={`flex-1 px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  customizationSourceScope === "org"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                Org
              </button>
              <button
                type="button"
                onClick={() =>
                  !disabled &&
                  setScriptValues((p) => ({ ...p, _customizationSourceScope: "company" }))
                }
                disabled={disabled}
                className={`flex-1 px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  customizationSourceScope === "company"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                Company
              </button>
              <button
                type="button"
                onClick={() =>
                  !disabled &&
                  setScriptValues((p) => ({ ...p, _customizationSourceScope: "user" }))
                }
                disabled={disabled}
                className={`flex-1 px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  customizationSourceScope === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                User
              </button>
            </div>
          </div>
          <div>
            <label className={sideLabel}>Target entity</label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  !disabled &&
                  setScriptValues((p) => ({ ...p, _customizationTargetScope: "org" }))
                }
                disabled={disabled}
                className={`flex-1 px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  customizationTargetScope === "org"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                Org
              </button>
              <button
                type="button"
                onClick={() =>
                  !disabled &&
                  setScriptValues((p) => ({ ...p, _customizationTargetScope: "company" }))
                }
                disabled={disabled}
                className={`flex-1 px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  customizationTargetScope === "company"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                Company
              </button>
              <button
                type="button"
                onClick={() =>
                  !disabled &&
                  setScriptValues((p) => ({ ...p, _customizationTargetScope: "user" }))
                }
                disabled={disabled}
                className={`flex-1 px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                  customizationTargetScope === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                User
              </button>
            </div>
          </div>
        </>
      )}
      {cfg.dualScopeSelector && (
        <>
          <div>
            <label className={sideLabel}>Source Scope</label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  !disabled &&
                  setScriptValues((p) => ({ ...p, _sourceScope: "org" }))
                }
                disabled={disabled}
                className={`flex-1 px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  sourceScope === "org"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                Organization
              </button>
              <button
                type="button"
                onClick={() =>
                  !disabled &&
                  setScriptValues((p) => ({ ...p, _sourceScope: "company" }))
                }
                disabled={disabled}
                className={`flex-1 px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  sourceScope === "company"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                Company
              </button>
            </div>
          </div>
          <div>
            <label className={sideLabel}>Target Scope</label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  !disabled &&
                  setScriptValues((p) => ({ ...p, _targetScope: "org" }))
                }
                disabled={disabled}
                className={`flex-1 px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  targetScope === "org"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                Organization
              </button>
              <button
                type="button"
                onClick={() =>
                  !disabled &&
                  setScriptValues((p) => ({ ...p, _targetScope: "company" }))
                }
                disabled={disabled}
                className={`flex-1 px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  targetScope === "company"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                Company
              </button>
            </div>
          </div>
        </>
      )}
      {cfg.scopeSelector && !cfg.dualScopeSelector && !cfg.customizationEntityScopes && (
        <div>
          <label className={sideLabel}>Scope</label>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() =>
                !disabled && setScriptValues((p) => ({ ...p, _scope: "org" }))
              }
              disabled={disabled}
              className={`flex-1 px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                currentScope === "org"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              } disabled:opacity-50`}
            >
              Organization
            </button>
            <button
              type="button"
              onClick={() =>
                !disabled &&
                setScriptValues((p) => ({ ...p, _scope: "company" }))
              }
              disabled={disabled}
              className={`flex-1 px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                currentScope === "company"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              } disabled:opacity-50`}
            >
              Company
            </button>
          </div>
        </div>
      )}
      {scriptKey === "copyCustomizations" && (
        <div>
          <label className={sideLabel}>Customization Sections</label>
          <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-white p-2">
            {customizationTypeOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-[12px] text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={selectedCustomizationTypes.includes(option.value)}
                  onChange={() => toggleCustomizationType(option.value)}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            Global, custom texts, and nav are on by default. Enable PDP, search form,
            search result, and/or product unified page only when you want those layout
            rows copied from the <code className="text-slate-600">customizations</code>{" "}
            table.
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            Select at least one section to copy.
          </p>
        </div>
      )}
      {scriptKey === "copyCustomDataAndValues" && (
        <div>
          <label className={sideLabel}>Copy Sections</label>
          <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-white p-2">
            {customDataSectionOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-[12px] text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={selectedCustomDataSections.includes(option.value)}
                  onChange={() => toggleCustomDataSection(option.value)}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            Select at least one section to copy.
          </p>
        </div>
      )}
      <div
        className={
          activeFields.length === 2 ? "flex flex-col gap-2" : "space-y-2"
        }
      >
        {activeFields.map((f) => (
          <div
            key={f.key}
            className={activeFields.length === 2 ? "flex-1 min-w-0" : ""}
          >
            <label className={sideLabel}>{f.label}</label>
            {scriptKey === "importCustomSearchMenusFromSheet" &&
            f.key === "xlsxPath" ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    className={sideInput}
                    value={scriptValues[f.key] || ""}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setScriptValues((p) => {
                        const uploadedName = p.xlsxFileUpload?.filename || "";
                        const keepUpload =
                          !!uploadedName && nextValue.trim() === uploadedName;
                        return {
                          ...p,
                          [f.key]: nextValue,
                          xlsxFileUpload: keepUpload ? p.xlsxFileUpload : null,
                        };
                      });
                    }}
                    onBlur={(e) => {
                      const trimmed = e.target.value.trim();
                      setScriptValues((p) => {
                        const uploadedName = p.xlsxFileUpload?.filename || "";
                        const keepUpload =
                          !!uploadedName && trimmed === uploadedName;
                        return {
                          ...p,
                          [f.key]: trimmed,
                          xlsxFileUpload: keepUpload ? p.xlsxFileUpload : null,
                        };
                      });
                    }}
                    placeholder={f.placeholder}
                    disabled={disabled}
                  />
                  <input
                    ref={sheetFileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const dataUrl = await readFileAsBase64(file);
                        const base64 = dataUrl.split(",")[1] || "";
                        setScriptValues((p) => ({
                          ...p,
                          xlsxPath: file.name,
                          xlsxFileUpload: {
                            filename: file.name,
                            contentBase64: base64,
                          },
                        }));
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                    disabled={disabled}
                    onClick={() => sheetFileInputRef.current?.click()}
                  >
                    Browse
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-[10px] text-slate-400">
                    Tip: You can paste a path or pick the file directly.
                  </p>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1cFRVoDdhwU9zlCH_q3e-TR5KkRvHuxiy9KmTU4SsaKo/edit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View sample sheet ↗
                  </a>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1cFRVoDdhwU9zlCH_q3e-TR5KkRvHuxiy9KmTU4SsaKo/export?format=xlsx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Download as .xlsx ↗
                  </a>
                </div>
              </div>
            ) : (
              <>
                <input
                  className={sideInput}
                  value={scriptValues[f.key] || ""}
                  onChange={(e) => {
                    setScriptValues((p) => ({ ...p, [f.key]: e.target.value }));
                    setIdHints((h) => ({ ...h, [f.key]: null }));
                  }}
                  onBlur={async (e) => {
                    const trimmed = e.target.value.trim();
                    setScriptValues((p) => ({ ...p, [f.key]: trimmed }));
                    await resolveFieldHint(f, trimmed);
                  }}
                  placeholder={f.placeholder}
                  disabled={disabled}
                />
                {idHints[f.key]?.loading && (
                  <p className="mt-1 text-[10px] text-slate-400">Looking up…</p>
                )}
                {idHints[f.key] && !idHints[f.key].loading && idHints[f.key].name && (
                  <p className="mt-1 text-[10px] font-semibold text-emerald-800">
                    → {idHints[f.key].name}
                  </p>
                )}
                {idHints[f.key]?.loading === false &&
                  idHints[f.key].name == null &&
                  /^\d+$/.test(String(scriptValues[f.key] || "").trim()) && (
                    <p className="mt-1 text-[10px] text-amber-700">
                      No matching record for this ID.
                    </p>
                  )}
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
