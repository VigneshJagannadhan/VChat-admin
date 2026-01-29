import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface AppVersion {
    latestVersion: string;
    minSupportedVersion: string;
    forceUpdate: boolean;
    updateMessage: string;
}

const Dashboard: React.FC = () => {
    const [version, setVersion] = useState<AppVersion>({
        latestVersion: '',
        minSupportedVersion: '',
        forceUpdate: false,
        updateMessage: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchVersion();
    }, []);

    const fetchVersion = async () => {
        try {
            const { data } = await api.get('/app/version');
            setVersion(data);
        } catch (err) {
            console.error('Failed to fetch version', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/app/version', version);
            setMessage('App version updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/');
            }
            setMessage('Failed to update version');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setVersion(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    }

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">App Version Management</h1>
                    <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-medium">Logout</button>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    {message && (
                        <div className={`p-4 mb-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Latest Version</label>
                                <input
                                    type="text"
                                    name="latestVersion"
                                    value={version.latestVersion}
                                    onChange={handleChange}
                                    placeholder="e.g. 1.2.0"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Min Supported Version</label>
                                <input
                                    type="text"
                                    name="minSupportedVersion"
                                    value={version.minSupportedVersion}
                                    onChange={handleChange}
                                    placeholder="e.g. 1.0.0"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Update Message</label>
                            <textarea
                                name="updateMessage"
                                value={version.updateMessage}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="forceUpdate"
                                id="forceUpdate"
                                checked={version.forceUpdate}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="forceUpdate" className="ml-2 block text-sm text-gray-900">
                                Force Update
                            </label>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
