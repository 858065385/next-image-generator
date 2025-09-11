'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  uuid: string;
  email: string;
  nickname: string;
  created_at: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadUsers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const url = new URL('/api/users/list', window.location.origin);
      if (search) {
        url.searchParams.append('search', search);
      }
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '20');

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 0) {
        const responseData: UsersResponse = data.data;
        setUsers(responseData.users);
        setCurrentPage(responseData.pagination.current_page);
        setTotalPages(responseData.pagination.total_pages);
        setTotalItems(responseData.pagination.total_items);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadUsers(page, searchTerm);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#333' }}>用户列表</h1>
      </div>

      {/* 搜索框 */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="搜索用户（邮箱或昵称）"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '300px',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginRight: '10px'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          搜索
        </button>
      </form>

      {/* 用户表格 */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>加载中...</div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>昵称</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>邮箱</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>注册时间</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px' }}>{user.id}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '500' }}>{user.nickname}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Link
                          href={`/admin/users/${user.uuid}`}
                          style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            background: '#007bff',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          查看详情
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '50px', textAlign: 'center', color: '#666' }}>
                      暂无用户数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 分页 */}
            {totalPages > 1 && (
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ddd',
                    background: 'white',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  上一页
                </button>
                
                <span style={{ color: '#666' }}>
                  第 {currentPage} 页，共 {totalPages} 页（总计 {totalItems} 个用户）
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ddd',
                    background: 'white',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
