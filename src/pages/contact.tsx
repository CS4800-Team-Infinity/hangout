"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Sending...");

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          name: form.name,
          email: form.email,
          message: form.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      .then(() => {
        setStatus("Message sent!");
        setForm({ name: "", email: "", message: "" });
      })
      .catch(() => setStatus("Failed to send."));
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "80px",
        padding: "100px 100px",
        backgroundColor: "#f5f5f7",
        minHeight: "100vh",
        color: "black",
      }}
    >
      {/* LEFT FORM */}
      <form style={{ width: "400px" }} onSubmit={handleSubmit}>
        <h1
          style={{ fontSize: "32px", marginBottom: "10px", fontWeight: "600" }}
        >
          Get in touch
        </h1>

        <p
          style={{
            color: "#555",
            marginBottom: "30px",
            fontSize: "16px",
            maxWidth: "420px",
          }}
        >
          Whether you have questions, want to collaborate, advertise, or just
          share feedback, feel free to reach out. We're happy to hear from you.
        </p>

        <div
          style={{
            width: "100%",
            height: "1px",
            background: "linear-gradient(to right, #a855f7, #3b82f6)",
            marginBottom: "40px",
          }}
        ></div>

        <input
          type="text"
          placeholder="Your name*"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{
            width: "100%",
            marginBottom: "20px",
            padding: "14px",
            borderRadius: "12px",
            border: "2px solid transparent",
            background:
              "linear-gradient(white, white) padding-box, linear-gradient(90deg, #a855f7, #3b82f6) border-box",
            outline: "none",
          }}
        />

        <input
          type="email"
          placeholder="Email*"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          style={{
            width: "100%",
            marginBottom: "20px",
            padding: "14px",
            borderRadius: "12px",
            border: "2px solid transparent",
            background:
              "linear-gradient(white, white) padding-box, linear-gradient(90deg, #a855f7, #3b82f6) border-box",
            outline: "none",
          }}
        />

        <textarea
          placeholder="Message*"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          style={{
            width: "100%",
            marginBottom: "20px",
            padding: "14px",
            borderRadius: "12px",
            border: "2px solid transparent",
            background:
              "linear-gradient(white, white) padding-box, linear-gradient(90deg, #a855f7, #3b82f6) border-box",
            outline: "none",
            height: "120px",
            resize: "none",
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: "10px",
            padding: "10px 26px",
            borderRadius: "14px",
            border: "none",
            fontSize: "16px",
            background: "linear-gradient(90deg, #5D5FEF, #EF5DA8)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Submit
        </button>

        <p style={{ marginTop: "16px" }}>{status}</p>
      </form>

      {/* RIGHT MAP */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          textAlign: "left",
          width: "600px",
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "12px",
          }}
        >
          📍 Cal Poly Pomona, California, USA
        </h2>

        <iframe
          width="600"
          height="500"
          style={{ borderRadius: "12px", border: "none", marginBottom: "16px" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d42485.24016680754!2d-117.81056!3d34.057315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c336a4ab53e77f%3A0xa0c45e768ff09c03!2sCal%20Poly%20Pomona!5e0!3m2!1sen!2sus!4v1700520227991"
        ></iframe>

        <p style={{ fontSize: "16px", opacity: 0.8 }}>
          🕒 Time Zone: Pacific Time <span>(UTC -08:00)</span>
        </p>
      </div>
    </div>
  );
}
