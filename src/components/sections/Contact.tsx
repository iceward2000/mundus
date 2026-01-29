"use client";

import { useState, useRef, useEffect } from "react";
import SectionWrapper from "../SectionWrapper";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import clsx from "clsx";
import gsap from "gsap";

// Helper component for Floating Label Input with Smooth Alignment Animation
const FloatingInput = ({ 
  label, 
  id, 
  name, 
  type = "text", 
  value, 
  onChange, 
  required = false,
  isTextArea = false 
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  isTextArea?: boolean;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasValue = value.length > 0;

  useEffect(() => {
    // Determine target alignment and calculate transform
    if (containerRef.current && spanRef.current && inputRef.current) {
      if (isTextArea) return; // Skip complex animation for textarea for now as it wraps

      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = spanRef.current.offsetWidth;
      
      // If we are NOT focused and have a value, we want to align right.
      // We calculate the offset needed to push the text to the right edge.
      // offset = containerWidth - textWidth - padding(optional)
      // Note: text-align is left, so text starts at 0.
      // To move it to right, we translate X by (containerWidth - textWidth).
      
      let xOffset = 0;
      if (!isFocused && hasValue) {
        // Limit the offset so we don't push short text off if logic fails, 
        // but typically it should be positive. 
        // Also subtract a small buffer if needed? No, exact alignment is better.
        xOffset = Math.max(0, containerWidth - textWidth);
      }

      // Apply transform smoothly
      inputRef.current.style.transform = `translateX(${xOffset}px)`;
    }
  }, [isFocused, hasValue, value, isTextArea]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full group border-b border-white/20 transition-colors duration-300 focus-within:border-primary overflow-hidden"
    >
      {/* Hidden span to measure text width */}
      <span 
        ref={spanRef} 
        className="absolute opacity-0 pointer-events-none whitespace-pre font-sans text-base"
        aria-hidden="true"
      >
        {value || " "}
      </span>

      {isTextArea ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={4}
          className="w-full bg-transparent px-0 py-3 text-white focus:outline-none transition-all duration-500 ease-out resize-none block"
          style={{ 
             // For textarea, just keep standard behavior for now or apply simple right align if possible
             // But user asked for "single line for visitors to right" which is confusing for textarea.
             // We'll keep textarea standard left-aligned or maybe simple text-align transition if supported (it's not).
             textAlign: !isFocused && hasValue ? 'right' : 'left'
          }}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          id={id}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent px-0 py-3 text-white focus:outline-none transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] block"
          // Removed text-align right class, using transform instead
        />
      )}
      
      <label
        htmlFor={id}
        className={clsx(
          "absolute left-0 pointer-events-none transition-all duration-300 ease-out text-white/50",
          (isFocused || hasValue) ? "-top-2 text-xs text-primary" : "top-3 text-base"
        )}
      >
        {label}
      </label>
    </div>
  );
};

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    position: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  
  const planeRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // API call
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send");

      // Animation
      if (planeRef.current && window.innerWidth > 768) { // Only animate heavily on desktop
        const tl = gsap.timeline();
        const buttonRect = buttonRef.current?.getBoundingClientRect();
        
        if (buttonRect) {
            tl.to(planeRef.current, {
                display: "block",
                x: 0,
                y: 0,
                duration: 0
            })
            .to(planeRef.current, {
                x: window.innerWidth - buttonRect.left,
                y: -window.innerHeight,
                duration: 1.5,
                ease: "power2.inOut",
                onComplete: () => {
                    gsap.set(planeRef.current, { display: "none", x: 0, y: 0 });
                }
            });
        }
      }

      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        company: "",
        position: "",
        phone: "",
        email: "",
        message: "",
      });

    } catch (error) {
      console.error(error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <SectionWrapper id="contact" className="min-h-screen py-20 relative overflow-hidden">
      <div className="max-w-2xl mx-auto w-full px-4 md:px-0 z-10 relative">
        <div className="text-center mb-12 space-y-4">
          <span className="text-primary text-sm tracking-widest uppercase">06 / Contact</span>
          <h2 className="text-4xl md:text-6xl font-serif">Let&apos;s Work Together</h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Ready to elevate your brand? Fill out the form below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10 p-6">
          <FloatingInput
            id="firstName"
            name="firstName"
            label="Ad"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <FloatingInput
            id="lastName"
            name="lastName"
            label="Soyad"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <FloatingInput
            id="company"
            name="company"
            label="Şirket"
            value={formData.company}
            onChange={handleChange}
          />

          <FloatingInput
            id="position"
            name="position"
            label="Pozisyon"
            value={formData.position}
            onChange={handleChange}
          />

          <FloatingInput
            id="phone"
            name="phone"
            type="tel"
            label="Telefon"
            value={formData.phone}
            onChange={handleChange}
          />

          <FloatingInput
            id="email"
            name="email"
            type="email"
            label="E-posta"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <FloatingInput
            id="message"
            name="message"
            label="Danışmanlık Talebi"
            value={formData.message}
            onChange={handleChange}
            required
            isTextArea
          />

          <div className="pt-8 flex justify-end relative">
             {/* Paper Plane for Animation */}
            <div ref={planeRef} className="absolute right-8 top-1/2 -translate-y-1/2 text-primary hidden z-50 pointer-events-none">
                <Send size={24} className="-rotate-45" />
            </div>

            <button
              ref={buttonRef}
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className={clsx(
                "group relative overflow-hidden rounded-full px-8 py-4 min-w-[200px] flex items-center justify-center transition-all duration-300",
                 submitStatus === 'success' ? "bg-green-500/20 border-green-500 text-green-500" : "bg-primary text-black hover:bg-white hover:scale-105"
              )}
            >
              {isSubmitting ? (
                <div className="h-6 w-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : submitStatus === 'success' ? (
                <span className="flex items-center gap-2 font-medium tracking-wide">
                  <CheckCircle2 size={20} /> Sent Successfully
                </span>
              ) : submitStatus === 'error' ? (
                 <span className="flex items-center gap-2 font-medium tracking-wide text-red-600">
                  <AlertCircle size={20} /> Error
                </span>
              ) : (
                <span className="flex items-center gap-2 font-medium tracking-widest uppercase">
                  Send Request <Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </form>

        <footer className="mt-20 text-center text-xs text-white/30 uppercase tracking-widest">
          © {new Date().getFullYear()} Mundus Consultancy. All Rights Reserved.
        </footer>
      </div>
    </SectionWrapper>
  );
}
