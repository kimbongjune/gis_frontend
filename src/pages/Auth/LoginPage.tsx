import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate login
        if (id && pw) {
            navigate('/');
        } else {
            alert('아이디와 비밀번호를 입력해주세요.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">광주 남구<br />스마트 하수악취 관리</h1>
                    <p className="text-blue-200 text-sm">Authorized Personnel Only</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">아이디</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 placeholder-gray-400"
                                    placeholder="아이디를 입력하세요"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">비밀번호</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 placeholder-gray-400"
                                    placeholder="비밀번호를 입력하세요"
                                    value={pw}
                                    onChange={(e) => setPw(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            로그인
                        </button>
                    </form>

                    <div className="mt-6 flex justify-center text-sm">
                        <a href="#" className="text-gray-500 hover:text-blue-600">비밀번호 찾기</a>
                        <span className="mx-2 text-gray-300">|</span>
                        <a href="#" className="text-gray-500 hover:text-blue-600">시스템 문의</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
