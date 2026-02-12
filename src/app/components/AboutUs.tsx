import React from 'react';
import { Heart, Users, Globe, Award, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

interface AboutUsProps {
    language?: 'en' | 'ko';
    onBack?: () => void;
}

export function AboutUs({ language = 'en', onBack }: AboutUsProps) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">
                        {language === 'ko' ? 'ARMY Stay Hub 소개' : 'About ARMY Stay Hub'}
                    </h1>
                    <p className="text-lg opacity-90">
                        {language === 'ko'
                            ? '전 세계 ARMY를 위한 최고의 숙소 예약 플랫폼'
                            : 'The Ultimate Accommodation Platform for ARMYs Worldwide'}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                {/* Mission */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-purple-600" />
                            {language === 'ko' ? '우리의 미션' : 'Our Mission'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                            {language === 'ko'
                                ? 'ARMY Stay Hub는 BTS 콘서트를 관람하는 전 세계 ARMY들이 안전하고 편안하며 합리적인 가격의 숙소를 찾을 수 있도록 돕기 위해 만들어졌습니다.'
                                : 'ARMY Stay Hub was created to help ARMYs from around the world find safe, comfortable, and affordable accommodations for BTS concerts.'}
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            {language === 'ko'
                                ? '우리는 단순한 숙박 예약 서비스를 넘어, ARMY 커뮤니티의 니즈를 반영한 맞춤형 추천 시스템과 현지 정보를 제공합니다.'
                                : 'We go beyond simple accommodation booking by offering a personalized recommendation system and local insights tailored to the ARMY community.'}
                        </p>
                    </CardContent>
                </Card>

                {/* What We Offer */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-600" />
                            {language === 'ko' ? '제공 서비스' : 'What We Offer'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 font-bold">1</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {language === 'ko' ? 'Fan Match Score 시스템' : 'Fan Match Score System'}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {language === 'ko'
                                            ? '해외 ARMY 커뮤니티의 니즈를 분석하여 각 호텔의 적합도를 점수화합니다.'
                                            : 'We analyze international ARMY community needs to score each hotel\'s suitability.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 font-bold">2</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {language === 'ko' ? '안전한 귀가 정보' : 'Safe Return Information'}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {language === 'ko'
                                            ? '늦은 시간 콘서트 후에도 안전하게 숙소로 돌아갈 수 있도록 교통 정보와 경로를 제공합니다.'
                                            : 'We provide transportation info and routes for safe return after late-night concerts.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 font-bold">3</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {language === 'ko' ? '현지 ARMY 가이드' : 'Local ARMY Guides'}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {language === 'ko'
                                            ? '한국 ARMY들의 추천 맛집, 카페, BTS 관련 명소를 공유합니다.'
                                            : 'Share recommended restaurants, cafes, and BTS-related spots from Korean ARMYs.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 font-bold">4</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {language === 'ko' ? '실시간 재고 및 가격' : 'Real-time Availability & Pricing'}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {language === 'ko'
                                            ? '주요 OTA와 연동하여 최신 가격과 재고 정보를 제공합니다.'
                                            : 'Integrated with major OTAs to provide up-to-date pricing and availability.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Team */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            {language === 'ko' ? '팀 소개' : 'Our Team'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-gray-700 leading-relaxed">
                            {language === 'ko'
                                ? '우리 팀은 BTS와 ARMY 커뮤니티를 사랑하는 개발자, 디자이너, 데이터 분석가들로 구성되어 있습니다. 우리는 기술을 통해 전 세계 ARMY들이 더 나은 여행 경험을 할 수 있도록 돕는 것을 목표로 합니다.'
                                : 'Our team consists of developers, designers, and data analysts who love BTS and the ARMY community. We aim to help ARMYs worldwide have better travel experiences through technology.'}
                        </p>
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-purple-600" />
                            {language === 'ko' ? '문의하기' : 'Contact Us'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                            <Globe className="w-4 h-4 text-purple-600" />
                            <a href="https://www.armystay.com" className="hover:text-purple-600 transition-colors">
                                www.armystay.com
                            </a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <Mail className="w-4 h-4 text-purple-600" />
                            <a href="mailto:support@armystay.com" className="hover:text-purple-600 transition-colors">
                                support@armystay.com
                            </a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span>Seoul, South Korea</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Note */}
                <div className="text-center pt-6 pb-4">
                    <p className="text-sm text-gray-500">
                        {language === 'ko'
                            ? '💜 ARMY를 위한, ARMY에 의한 서비스 💜'
                            : '💜 By ARMYs, For ARMYs 💜'}
                    </p>
                </div>
            </div>
        </div>
    );
}
