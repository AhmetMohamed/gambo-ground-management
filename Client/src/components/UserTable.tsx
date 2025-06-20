import React, { useState } from 'react';
import { format } from 'date-fns';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { User } from '../types/auth';

interface UserTableProps {
  users: User[];
  onUpdateStatus: (userId: string, active: boolean) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'email' | 'createdAt'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'name' | 'email' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === 'email') {
      return sortDirection === 'asc'
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);
    } else if (sortField === 'createdAt') {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage all registered users</CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="grid grid-cols-4 bg-muted p-3 rounded-t-md font-medium text-sm">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort('name')}
            >
              Name
              {sortField === 'name' &&
                (sortDirection === 'asc' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                ))}
            </div>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort('email')}
            >
              Email
              {sortField === 'email' &&
                (sortDirection === 'asc' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                ))}
            </div>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => handleSort('createdAt')}
            >
              Member Since
              {sortField === 'createdAt' &&
                (sortDirection === 'asc' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                ))}
            </div>
            <div className="text-center">Status</div>
          </div>

          <div>
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`grid grid-cols-4 p-3 items-center ${index < sortedUsers.length - 1 ? 'border-b' : ''}`}
                >
                  <div>{user.name}</div>
                  <div className="text-sm">{user.email}</div>
                  <div>
                    {user.createdAt
                      ? format(new Date(user.createdAt), 'MMM d, yyyy')
                      : 'N/A'}
                  </div>
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.active}
                        onCheckedChange={() => onUpdateStatus(user.id, !user.active)}
                        id={`user-active-${user.id}`}
                      />
                      <Label htmlFor={`user-active-${user.id}`}>
                        {user.active ? (
                          <span className="text-green-600 text-sm">Active</span>
                        ) : (
                          <span className="text-red-600 text-sm">Inactive</span>
                        )}
                      </Label>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchTerm
                  ? `No users found matching "${searchTerm}"`
                  : 'No users available'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserTable;