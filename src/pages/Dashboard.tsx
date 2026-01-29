import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAppVersion, updateAppVersion } from '../services/versionService';
import { ROUTES, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';
import type { AppVersion } from '../types';

const Dashboard: React.FC = () => {
    const [version, setVersion] = useState<AppVersion>({
        latestVersion: '',
        minSupportedVersion: '',
        forceUpdate: false,
        updateMessage: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        fetchVersion();
    }, []);

    const fetchVersion = async () => {
        try {
            const data = await getAppVersion();
            setVersion(data);
        } catch (err) {
            const error = err as Error;
            console.error('Failed to fetch version', error);
            setMessage(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        try {
            await updateAppVersion(version);
            setMessage(SUCCESS_MESSAGES.UPDATE_SUCCESS);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            const error = err as Error;
            console.error('Failed to update version', error);
            setMessage(error.message || 'Failed to update version');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setVersion(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate(ROUTES.LOGIN);
        } catch (error) {
            console.error('Logout error:', error);
            // Navigate anyway
            navigate(ROUTES.LOGIN);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        App Version Management
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                        aria-label="Logout"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    {message && (
                        <div
                            className={`p-4 mb-4 rounded ${message.includes('success')
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                            role="alert"
                            aria-live="polite"
                        >
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="latestVersion"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Latest Version
                                </label>
                                <input
                                    id="latestVersion"
                                    type="text"
                                    name="latestVersion"
                                    value={version.latestVersion}
                                    onChange={handleChange}
                                    placeholder="e.g. 1.2.0"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="minSupportedVersion"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Min Supported Version
                                </label>
                                <input
                                    id="minSupportedVersion"
                                    type="text"
                                    name="minSupportedVersion"
                                    value={version.minSupportedVersion}
                                    onChange={handleChange}
                                    placeholder="e.g. 1.0.0"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="updateMessage"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Update Message
                            </label>
                            <textarea
                                id="updateMessage"
                                name="updateMessage"
                                value={version.updateMessage}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isSubmitting}
                                placeholder="Enter update message for users..."
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
                                disabled={isSubmitting}
                            />
                            <label htmlFor="forceUpdate" className="ml-2 block text-sm text-gray-900">
                                Force Update
                            </label>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
