'use client';
import { useState } from 'react';
import useSWR from 'swr';
import {
  PageHeading,
  Panel,
  Badge,
  Progress,
  EmptyState,
  ErrorState,
  LoadingState,
  dateLabel,
} from '@/components/workspace/ui';
interface Record {
  _id: string;
  student?: { name: string };
  course?: { title: string };
  progressPercentage: number;
  isCompleted: boolean;
  createdAt: string;
}
export default function EnrollmentRecords() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Record[] }>(
    '/admin/enrollments',
  );
  const [search, setSearch] = useState('');
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState retry={() => void mutate()} />;
  const records = data?.data || [];
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Enrollment records"
        description="Course memberships and progress across the learning portal."
      />
      <Panel
        title="All enrollments"
        action={<Badge>{records.length} records</Badge>}
      >
        <label className="ws-field mb-6">
          <span className="sr-only">Search enrollment records</span>
          <input
            className="ws-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or course"
          />
        </label>
        {records.length ? (
          <div className="ws-table-wrap">
            <table className="ws-table">
              <caption className="sr-only">
                Student course enrollment records
              </caption>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Progress</th>
                  <th>Completion</th>
                  <th>Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .filter((r) =>
                    (r.student?.name + ' ' + r.course?.title)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((r) => (
                    <tr key={r._id}>
                      <td>{r.student?.name || 'Removed account'}</td>
                      <td>{r.course?.title || 'Unavailable course'}</td>
                      <td>
                        <Progress value={r.progressPercentage} />
                      </td>
                      <td>
                        <Badge tone={r.isCompleted ? 'success' : 'neutral'}>
                          {r.isCompleted ? 'Completed' : 'In progress'}
                        </Badge>
                      </td>
                      <td>{dateLabel(r.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No enrollment records yet"
            description="Records appear here when students enroll in published courses."
          />
        )}
      </Panel>
    </>
  );
}
