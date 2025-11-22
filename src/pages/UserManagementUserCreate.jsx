import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchableSelect from '../components/SearchableSelect';
import { DEPARTMENTS, getTeamsForDept } from '../data/orgStructure'
import { useTranslation } from 'react-i18next'

const roles = ['Admin', 'Manager', 'Agent', 'Viewer', 'Custom'];
const statuses = ['Active', 'Inactive', 'Suspended'];
// teams pulled dynamically based on selected department via orgStructure

const PERMISSIONS = {
  Tickets: ['view', 'create', 'update', 'delete', 'assign', 'close'],
  Customers: ['view', 'create', 'update', 'delete'],
  SLA: ['view', 'create', 'update', 'delete'],
  Reports: ['view', 'export'],
  'User Management': ['view', 'create', 'update', 'delete', 'changeRole'],
  Settings: ['view', 'update'],
  Integrations: ['view', 'configure'],
  'Custom Modules': ['view', 'create', 'update', 'delete'],
};

export default function UserManagementUserCreate() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    sendInvite: true,
    role: '',
    status: 'Active',
    department: '',
    team: '',
  });
  const [customPerms, setCustomPerms] = useState({});
  const [errors, setErrors] = useState({});

  const isCustomRole = useMemo(() => form.role === 'Custom', [form.role]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const togglePerm = (group, perm) => {
    setCustomPerms((prev) => {
      const groupSet = new Set(prev[group] || []);
      if (groupSet.has(perm)) groupSet.delete(perm);
      else groupSet.add(perm);
      return { ...prev, [group]: Array.from(groupSet) };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.fullName?.trim()) e.fullName = 'Full Name is required';
    if (!form.email?.trim()) e.email = 'Email is required';
    if (!form.role?.trim()) e.role = 'Role is required';
    if (!form.sendInvite && (form.password?.length || 0) < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form, permissions: isCustomRole ? customPerms : undefined };
    console.log('Create User payload', payload);
    alert('User created (mock). Returning to Users list.');
    navigate('/user-management/users');
  };

  return (
    <Layout title="User Management — Add New User">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold mb-4">Add New User</h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="glass-panel rounded-xl p-4">
            <div>
              <h2 className="card-title">1. Basic Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="label"><span className="label-text">Full Name</span></label>
                  <input className="input input-bordered w-full bg-transparent" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                  {errors.fullName && <p className="text-error text-sm mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="label"><span className="label-text">Email</span></label>
                  <input type="email" className="input input-bordered w-full bg-transparent" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                  {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="label"><span className="label-text">Phone (Optional)</span></label>
                  <input className="input input-bordered w-full bg-transparent" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </div>
                <div>
                  <label className="label"><span className="label-text">Username (Optional)</span></label>
                  <input className="input input-bordered w-full bg-transparent" value={form.username} onChange={(e) => updateField('username', e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Send Invite</span>
                      <input type="checkbox" className="toggle" checked={form.sendInvite} onChange={(e) => updateField('sendInvite', e.target.checked)} />
                    </label>
                  </div>
                  {!form.sendInvite && (
                    <div className="flex-1">
                      <label className="label"><span className="label-text">Password</span></label>
                      <input type="password" className="input input-bordered w-full bg-transparent" value={form.password} onChange={(e) => updateField('password', e.target.value)} />
                      {errors.password && <p className="text-error text-sm mt-1">{errors.password}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <div>
              <h2 className="card-title">2. Account Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="label"><span className="label-text">Role</span></label>
                  <SearchableSelect
                    className="w-full"
                    options={roles}
                    value={form.role}
                    onChange={(val) => updateField('role', val)}
                    
                  />
                  {errors.role && <p className="text-error text-sm mt-1">{errors.role}</p>}
                </div>
                <div>
                  <label className="label"><span className="label-text">Status</span></label>
                  <SearchableSelect
                    className="w-full"
                    options={statuses}
                    value={form.status}
                    onChange={(val) => updateField('status', val)}
                    
                  />
                </div>
                <div>
                  <label className="label"><span className="label-text">Department</span></label>
                  <SearchableSelect
                    className="w-full"
                    options={DEPARTMENTS.map(d => ({ value: d.name, label: d.name }))}
                    value={form.department}
                    onChange={(dept) => {
                      setForm(prev => {
                        const teamsForDept = getTeamsForDept(dept)
                        const teamValid = teamsForDept.includes(prev.team)
                        return { ...prev, department: dept, team: teamValid ? prev.team : '' }
                      })
                    }}
                    
                  />
                </div>
                <div>
                  <label className="label"><span className="label-text">Team</span></label>
                  <SearchableSelect
                    className="w-full"
                    options={getTeamsForDept(form.department)}
                    value={form.team}
                    onChange={(val) => updateField('team', val)}
                    placeholder={form.department ? (isArabic ? 'اختر الفريق' : 'Select team') : (isArabic ? 'اختر القسم أولاً' : 'Select department first')}
                    disabled={!form.department}
                  />
                </div>
              </div>
            </div>
          </div>

          {isCustomRole && (
            <div className="glass-panel rounded-xl p-4">
              <div>
                <h2 className="card-title">3. Permissions (Custom Role)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {Object.entries(PERMISSIONS).map(([group, perms]) => (
                    <div key={group} className="glass-panel rounded-lg p-3">
                      <h3 className="font-medium mb-2">{group}</h3>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((p) => {
                          const checked = (customPerms[group] || []).includes(p);
                          return (
                            <label key={p} className="cursor-pointer flex items-center gap-2">
                              <input type="checkbox" className="checkbox" checked={checked} onChange={() => togglePerm(group, p)} />
                              <span>{p}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn" onClick={() => navigate('/user-management/users')}>Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}