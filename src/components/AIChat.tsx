import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../context/LanguageContext';

const WHATSAPP = '201103657888';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

const getBotResponse = (input: string, lang: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes('مشروع') || lower.includes('project')) {
    return lang === 'ar'
      ? 'لدينا مشاريع رائعة في الرياض وجدة والدمام! يمكنك زيارة صفحة المشاريع لعرض جميع مشاريعنا، أو تواصل معنا مباشرة للحصول على معلومات تفصيلية.'
      : 'We have amazing projects in Riyadh, Jeddah, and Dammam! Visit our Projects page to see all projects, or contact us directly for detailed information.';
  }
  if (lower.includes('سعر') || lower.includes('price') || lower.includes('تكلفة') || lower.includes('cost')) {
    return lang === 'ar'
      ? 'تختلف الأسعار حسب نوع المشروع والموقع والمساحة. يسعدنا تقديم عرض سعر مخصص لك. هل تريد التواصل مع فريقنا؟'
      : 'Prices vary by project type, location, and size. We\'d be happy to provide a customized price offer. Would you like to contact our team?';
  }
  if (lower.includes('استشارة') || lower.includes('consult')) {
    return lang === 'ar'
      ? 'يسعدنا تقديم استشارة مجانية! يمكنك التواصل معنا عبر واتساب أو ملء نموذج التواصل وسيقوم فريقنا بالتواصل معك خلال 24 ساعة.'
      : 'We\'re happy to provide a free consultation! Contact us via WhatsApp or fill out the contact form and our team will reach you within 24 hours.';
  }
  if (lower.includes('عن') || lower.includes('شركة') || lower.includes('about') || lower.includes('company')) {
    return lang === 'ar'
      ? 'شركة الهشام للتطوير العقاري شركة متخصصة تأسست على قيم الابتكار والجودة والشفافية. لدينا خبرة تمتد لأكثر من 15 عاماً في مجال التطوير العقاري.'
      : 'AL HISHAM DEVELOPMENT is a specialized company built on values of innovation, quality, and transparency, with over 15 years of real estate development experience.';
  }
  if (lower.includes('تواصل') || lower.includes('contact') || lower.includes('اتصال')) {
    return lang === 'ar'
      ? `يمكنك التواصل معنا عبر:\n📱 واتساب: +20 110 365 7888\n📧 hisham841978@gmail.com\n⏰ الأحد - الخميس: 8ص - 6م`
      : `You can reach us via:\n📱 WhatsApp: +20 110 365 7888\n📧 hisham841978@gmail.com\n⏰ Sun - Thu: 8AM - 6PM`;
  }
  return lang === 'ar'
    ? 'شكراً على تواصلك! يسعدني مساعدتك. يمكنك السؤال عن مشاريعنا، خدماتنا، الأسعار، أو التواصل المباشر مع فريقنا عبر واتساب.'
    : 'Thank you for reaching out! I\'m happy to help. You can ask about our projects, services, prices, or contact our team directly via WhatsApp.';
};

export default function AIChat() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: lang === 'ar'
        ? 'مرحباً! أنا مساعد الهشام الذكي 🏢 كيف يمكنني مساعدتك اليوم؟'
        : 'Hello! I\'m the AL HISHAM Smart Assistant 🏢 How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = lang === 'ar'
    ? ['عرض المشاريع', 'طلب استشارة', 'الأسعار والعروض', 'تواصل مع الفريق']
    : ['View Projects', 'Request Consultation', 'Prices & Offers', 'Contact Team'];

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const botResponse = getBotResponse(text, lang);
      const botMsg: Message = { id: Date.now() + 1, text: botResponse, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, 800);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="ai-chat-float">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 ltr:right-0 rtl:left-0 w-80 sm:w-96 bg-white dark:bg-dark-100 rounded-2xl shadow-luxury-dark border border-gray-100 dark:border-dark-300 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-primary px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center font-bold text-dark text-sm">
                  AI
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{t('ai_chat.title')}</p>
                <p className="text-primary-lighter text-xs">متصل الآن • Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title="WhatsApp"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors text-lg"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-surface dark:bg-dark-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                    H
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-white dark:bg-dark-300 text-dark dark:text-white rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-gray-100 dark:border-dark-300 flex gap-2 flex-wrap">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => sendMessage(action)}
                className="text-xs px-3 py-1.5 bg-primary/10 text-primary dark:text-gold border border-primary/20 hover:bg-primary hover:text-white transition-all duration-200 rounded-full"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 dark:border-dark-300 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder={t('ai_chat.placeholder')}
              className="flex-1 px-4 py-2.5 text-sm bg-surface dark:bg-dark-300 border border-gray-200 dark:border-dark-400 focus:outline-none focus:border-primary dark:focus:border-gold text-dark dark:text-white placeholder-gray-400 rounded-full"
            />
            <button
              onClick={() => sendMessage(input)}
              className="w-10 h-10 bg-primary hover:bg-primary-light text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-dark-300 text-white rotate-0' : 'bg-primary text-white animate-pulse-glow'
        }`}
        aria-label="AI Chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Notification Badge */}
      {!isOpen && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-dark text-xs font-bold rounded-full flex items-center justify-center">
          1
        </span>
      )}
    </div>
  );
}
