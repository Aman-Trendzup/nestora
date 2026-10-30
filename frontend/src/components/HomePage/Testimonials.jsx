import React from "react";

const testimonials = [
  {
    name: "Solomun",
    role: "Kaggel Keldp",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=80",
    review:
      "The entire experience was wonderful. Finding the right space made everything so much simpler.",
    className: "left-card",
  },
  {
    name: "Anissa Mat",
    role: "Hippod Snacks",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80",
    review:
      "Finding great workspaces has never been this easy. The booking process is simple and convenient.",
    className: "center-card",
  },
  {
    name: "Albert Hoffman",
    role: "Hamburg Burger",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&h=160&q=80",
    review:
      "A fantastic way to discover flexible workspaces. Everything feels thoughtful and effortless.",
    className: "right-card",
  },
];

export default function Testimonials() {
  return (
    <section className="overflow-hidden bg-white px-5 py-14 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-medium tracking-tight text-[#171717] sm:text-[30px]">
          What our customers says?
        </h2>

        <div className="relative mx-auto mt-12 grid max-w-4xl grid-cols-1 items-center gap-12 sm:grid-cols-3 sm:gap-5 lg:gap-7">
          {testimonials.map((item, index) => (
            <article
              key={item.name}
              className={`relative mx-auto flex min-h-[220px] w-full max-w-[280px] flex-col items-center rounded-[35px] border border-[#f5f5f5] bg-white px-5 pb-6 pt-10 text-center shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1 sm:min-h-[225px] ${item.className} ${
                index === 1 ? "sm:scale-105" : ""
              }`}
            >
              {/* Green decorative curve */}
              <div
                className={`pointer-events-none absolute -z-0 rounded-[38px] border-[6px] border-primary ${
                  index === 0
                    ? "-left-1 -top-1 h-[76%] w-[calc(100%+8px)] border-b-transparent border-r-transparent"
                    : index === 1
                      ? "-right-1 -top-1 h-[78%] w-[calc(100%+8px)] border-b-transparent border-l-transparent"
                      : "-left-1 top-3 h-[78%] w-[calc(100%+8px)] border-t-transparent border-r-transparent"
                }`}
              />

              {/* Profile */}
              <img
                src={item.image}
                alt={item.name}
                className={`absolute left-1/2 top-0 z-10 h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-white object-cover shadow-sm ${
                  index === 1 ? "sm:h-[76px] sm:w-[76px]" : ""
                }`}
              />

              <h3 className="relative z-10 mt-1 text-[15px] font-medium text-[#282828]">
                {item.name}
              </h3>

              <p className="relative z-10 mt-0.5 text-[10px] text-[#888888]">
                {item.role}
              </p>

              <span className="relative z-10 mt-2 h-4 text-2xl font-bold leading-none text-[#16a765]">
                ”
              </span>

              <p className="relative z-10 mt-1 max-w-[210px] text-[10px] italic leading-[1.65] text-[#999999]">
                {item.review}
              </p>
            </article>
          ))}
        </div>

        {/* Decorative arrows */}
        <div className="mt-7 flex justify-end gap-2 pr-2 text-[#111111]">
          <span className="text-xl leading-none">↙</span>
          <span className="text-xl leading-none">↗</span>
        </div>
      </div>
    </section>
  );
}