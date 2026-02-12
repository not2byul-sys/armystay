import React from 'react';
import { Shield, Lock, Eye, UserCheck, Database, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface PrivacyPolicyProps {
    language?: 'en' | 'ko';
    onBack?: () => void;
}

export function PrivacyPolicy({ language = 'en', onBack }: PrivacyPolicyProps) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-8 h-8" />
                        <h1 className="text-3xl font-bold">
                            {language === 'ko' ? '개인정보 처리방침' : 'Privacy Policy'}
                        </h1>
                    </div>
                    <p className="text-sm opacity-90">
                        {language === 'ko' ? '최종 업데이트: 2026년 2월 7일' : 'Last Updated: February 7, 2026'}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                {/* Introduction */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-blue-600" />
                            {language === 'ko' ? '개요' : 'Introduction'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-gray-700 leading-relaxed">
                            {language === 'ko'
                                ? 'ARMY Stay Hub("회사", "우리", "저희")는 귀하의 개인정보를 보호하고 관련 법령을 준수하기 위해 최선을 다하고 있습니다. 본 개인정보 처리방침은 귀하가 우리의 서비스를 이용할 때 수집, 사용, 공개되는 정보에 대해 설명합니다.'
                                : 'ARMY Stay Hub ("Company", "we", "us", "our") is committed to protecting your privacy and complying with applicable data protection laws. This Privacy Policy explains what information we collect, use, and disclose when you use our services.'}
                        </p>
                    </CardContent>
                </Card>

                {/* Information We Collect */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-600" />
                            {language === 'ko' ? '수집하는 정보' : 'Information We Collect'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                {language === 'ko' ? '1. 계정 정보' : '1. Account Information'}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {language === 'ko'
                                    ? '회원가입 시 이메일 주소, 이름, 비밀번호를 수집합니다. 소셜 로그인을 사용하는 경우, 해당 플랫폼에서 제공하는 프로필 정보를 수집할 수 있습니다.'
                                    : 'When you create an account, we collect your email address, name, and password. If you use social login, we may collect profile information provided by that platform.'}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                {language === 'ko' ? '2. 예약 정보' : '2. Booking Information'}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {language === 'ko'
                                    ? '숙소 예약 시 체크인/체크아웃 날짜, 인원수, 특별 요청사항 등을 수집합니다. 결제 정보는 제3자 결제 대행사에서 안전하게 처리됩니다.'
                                    : 'When booking accommodation, we collect check-in/check-out dates, number of guests, and special requests. Payment information is securely processed by third-party payment processors.'}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                {language === 'ko' ? '3. 사용 데이터' : '3. Usage Data'}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {language === 'ko'
                                    ? '서비스 이용 시 IP 주소, 브라우저 유형, 방문 페이지, 클릭 패턴 등의 정보를 자동으로 수집합니다.'
                                    : 'We automatically collect information such as IP address, browser type, pages visited, and click patterns when you use our services.'}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                {language === 'ko' ? '4. 쿠키 및 추적 기술' : '4. Cookies and Tracking Technologies'}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {language === 'ko'
                                    ? '쿠키와 유사한 기술을 사용하여 사용자 경험을 개선하고 서비스를 분석합니다. 브라우저 설정에서 쿠키를 거부할 수 있습니다.'
                                    : 'We use cookies and similar technologies to improve user experience and analyze our services. You can refuse cookies in your browser settings.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* How We Use Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                            {language === 'ko' ? '정보 사용 목적' : 'How We Use Your Information'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '서비스 제공 및 유지관리' : 'Provide and maintain our services'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '개인화된 추천 제공' : 'Provide personalized recommendations'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '고객 지원 및 문의 응답' : 'Provide customer support and respond to inquiries'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '서비스 개선 및 새로운 기능 개발' : 'Improve our services and develop new features'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '마케팅 및 프로모션 정보 발송 (동의 시)' : 'Send marketing and promotional information (with consent)'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '사기 방지 및 보안 유지' : 'Prevent fraud and maintain security'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '법적 의무 준수' : 'Comply with legal obligations'}</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Data Sharing */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-600" />
                            {language === 'ko' ? '정보 공유' : 'Information Sharing'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-gray-700 leading-relaxed">
                            {language === 'ko'
                                ? '우리는 다음의 경우를 제외하고는 귀하의 개인정보를 제3자와 공유하지 않습니다:'
                                : 'We do not share your personal information with third parties except in the following cases:'}
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '숙박 파트너 (예약 처리를 위해)' : 'Accommodation partners (to process bookings)'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '결제 대행사 (결제 처리를 위해)' : 'Payment processors (to process payments)'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '서비스 제공업체 (호스팅, 분석 등)' : 'Service providers (hosting, analytics, etc.)'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '법적 요구 사항에 따른 공개' : 'As required by law'}</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Data Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-600" />
                            {language === 'ko' ? '데이터 보안' : 'Data Security'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-gray-700 leading-relaxed">
                            {language === 'ko'
                                ? '우리는 귀하의 개인정보를 보호하기 위해 산업 표준의 보안 조치를 구현하고 있습니다. 여기에는 암호화, 접근 제어, 정기적인 보안 감사가 포함됩니다. 그러나 인터넷을 통한 전송은 100% 안전하지 않을 수 있습니다.'
                                : 'We implement industry-standard security measures to protect your personal information, including encryption, access controls, and regular security audits. However, no transmission over the internet can be 100% secure.'}
                        </p>
                    </CardContent>
                </Card>

                {/* Your Rights */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                            {language === 'ko' ? '귀하의 권리' : 'Your Rights'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-gray-700 leading-relaxed mb-3">
                            {language === 'ko'
                                ? '귀하는 다음의 권리를 가집니다:'
                                : 'You have the following rights:'}
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '개인정보 열람 및 사본 요청' : 'Access and obtain a copy of your personal information'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '부정확한 정보의 수정 요청' : 'Request correction of inaccurate information'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '개인정보 삭제 요청' : 'Request deletion of your personal information'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '처리 제한 요청' : 'Request restriction of processing'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '데이터 이동권' : 'Data portability'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{language === 'ko' ? '마케팅 수신 거부' : 'Opt-out of marketing communications'}</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {language === 'ko' ? '문의하기' : 'Contact Us'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-gray-700 leading-relaxed">
                            {language === 'ko'
                                ? '개인정보 처리방침에 대한 질문이나 우려사항이 있으시면 다음으로 연락주시기 바랍니다:'
                                : 'If you have any questions or concerns about this Privacy Policy, please contact us at:'}
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                            <p className="font-semibold text-gray-900">ARMY Stay Hub</p>
                            <p className="text-gray-600">Email: privacy@armystay.com</p>
                            <p className="text-gray-600">Address: Seoul, South Korea</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center pt-6 text-xs text-gray-500">
                    <p>{language === 'ko' ? '© 2026 ARMY Stay Hub. 모든 권리 보유.' : '© 2026 ARMY Stay Hub. All rights reserved.'}</p>
                </div>
            </div>
        </div>
    );
}
