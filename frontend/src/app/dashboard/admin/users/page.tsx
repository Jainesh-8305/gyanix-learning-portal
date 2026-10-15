'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { apiError } from '@/lib/errors';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  PageHeading,
  Panel,
  Badge,
  EmptyState,
  LoadingState,
  ErrorState,
  dateLabel,
} from '@/components/workspace/ui';
interface Account {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}
export default function UserManagement() {
  const [search, setSearch] = useState(''),
    [role, setRole] = useState(''),
    [page, setPage] = useState(1),
    [busy, setBusy] = useState('');
  const settled = useDebouncedValue(search),
    query = new URLSearchParams({
      page: String(page),
      limit: '20',
      ...(role ? { role } : {}),
      ...(settled ? { search: settled } : {}),
    }).toString();
  const { data, error, isLoading, mutate } = useSWR<{
    data: Account[];
    total: number;
  }>('/admin/users?' + query);
  async function toggle(user: Account) {
    setBusy(user._id);
    try {
      await api.put(`/admin/users/${user._id}/toggle-status`);
      await mutate();
      toast.success(
        user.isActive ? 'Account deactivated' : 'Account activated',
      );
    } catch (e) {
      toast.error(apiError(e, 'Could not change account status'));
    } finally {
      setBusy('');
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="User management"
        description="Find accounts and manage access for students and instructors."
      />
      <Panel
        title="Account directory"
        action={<Badge>{data?.total || 0} accounts</Badge>}
      >
        <div className="ws-toolbar">
          <label className="ws-field">
            <span className="sr-only">Search users by name or email</span>
            <span className="flex items-center gap-2">
              <Search size={17} />
              <input
                className="ws-input"
                maxLength={100}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name or email"
              />
            </span>
          </label>
          <label className="ws-field">
            <span className="sr-only">Filter account role</span>
            <select
              className="ws-input"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Administrators</option>
            </select>
          </label>
        </div>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState retry={() => void mutate()} />
        ) : data?.data.length ? (
          <div className="ws-table-wrap">
            <table className="ws-table">
              <caption className="sr-only">
                Registered users and access controls
              </caption>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <h3>{user.name}</h3>
                      <p className="ws-small ws-muted">{user.email}</p>
                    </td>
                    <td>
                      <Badge>{user.role}</Badge>
                    </td>
                    <td>
                      <Badge tone={user.isActive ? 'success' : 'warning'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>{dateLabel(user.createdAt)}</td>
                    <td>
                      {user.role === 'admin' ? (
                        <span className="ws-small ws-muted">
                          Protected administrator
                        </span>
                      ) : (
                        <button
                          className="ws-button ws-secondary"
                          disabled={busy === user._id}
                          onClick={() => void toggle(user)}
                        >
                          {busy === user._id
                            ? 'Saving…'
                            : user.isActive
                              ? 'Deactivate'
                              : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No matching accounts"
            description="Try another name, email or role filter."
          />
        )}
        <div className="ws-toolbar mt-6 mb-0">
          <span className="ws-small ws-muted">
            Page {page} of {Math.max(1, Math.ceil((data?.total || 0) / 20))}
          </span>
          <div className="ws-actions">
            <button
              aria-label="Previous user page"
              className="ws-button ws-secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              aria-label="Next user page"
              className="ws-button ws-secondary"
              disabled={page * 20 >= (data?.total || 0)}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Panel>
    </>
  );
}
