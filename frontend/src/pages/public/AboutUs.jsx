import React from "react";

const workspaceImages = [
    {
        src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=700&q=85",
        alt: "Creative coworking space",
    },
    {
        src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=85",
        alt: "Collaborative workspace",
    },
    {
        src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=85",
        alt: "Modern office space",
    },
    {
        src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=85",
        alt: "Professional meeting space",
    },
];

const features = [
    {
        icon: "⌂",
        title: "Spaces for Every Need",
        description:
            "From private offices to flexible desks, find a space that fits your work style.",
    },
    {
        icon: "◎",
        title: "Easy & Flexible Booking",
        description:
            "Discover available spaces, choose your time, and book your next workspace effortlessly.",
    },
    {
        icon: "↗",
        title: "Designed for Growth",
        description:
            "Find inspiring environments that help you focus, collaborate, and achieve more.",
    },
];

export default function About() {
    return (
        <main className="overflow-hidden bg-[#FFFCF7] text-[#292823]">
            {/* HERO SECTION */}
            
<section className="relative isolate bg-black px-4 pb-8 pt-14 sm:px-6 sm:pb-10 sm:pt-16 lg:px-8 lg:pb-12 lg:pt-20">

    {/* Decorative elements */}
    <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[12%] top-10 text-2xl text-white sm:left-[20%] sm:top-12 sm:text-3xl lg:left-[25%]"
    >
        ✧
    </span>

    <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[17%] top-12 h-2 w-2 rounded-full border-2 border-white sm:right-[25%] sm:top-[68px]"
    />

    <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[13%] top-[65px] h-3 w-3 rounded-full border-2 border-white sm:right-[22%] sm:top-[78px]"
    />

    <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[16%] top-[90px] h-2 w-2 rounded-full border-2 border-white sm:right-[24%] sm:top-[105px]"
    />

    {/* Hero content */}
    <div className="relative z-10 mx-auto max-w-xl text-center">
        <span className="mb-3 block text-[9px] font-bold tracking-[2px] text-white sm:text-[10px] sm:tracking-[3px]">
            FIND YOUR PERFECT SPACE
        </span>

        <h1 className="text-3xl font-medium tracking-tight text-white sm:text-4xl md:text-[44px]">
            About us
        </h1>

        <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-white/80 sm:mt-4 sm:text-[13px] sm:leading-6">
            We connect people with workspaces that inspire
            creativity, encourage collaboration, and make
            every working day better.
        </p>
    </div>

    {/* Responsive image gallery */}
    <div className="relative z-20 mx-auto mt-8 grid w-full max-w-6xl grid-cols-2 items-center gap-3 sm:mt-10 sm:grid-cols-4 sm:gap-4">

        {workspaceImages.map((image, index) => (
            <div
                key={image.alt}
                className={`h-24 overflow-hidden rounded-lg shadow-sm sm:h-[120px] lg:h-[150px] ${
                    index === 1
                        ? "sm:translate-y-3"
                        : index === 2
                            ? "sm:translate-y-1"
                            : ""
                }`}
            >
                <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
            </div>
        ))}

    </div>
</section>


            {/* INTRODUCTION */}
            <section className="mx-auto w-[88%] max-w-6xl pb-2 pt-24 sm:pt-28">
                <h2 className="max-w-3xl text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
                    We make finding your perfect
                    <br className="hidden sm:block" /> workspace effortless
                </h2>

                <div className="mt-6 grid gap-5 text-xs leading-6 text-[#77746D] sm:grid-cols-2 sm:gap-12 sm:text-[13px]">
                    <p>
                        Finding the right place to work should be simple.
                        Whether you need a quiet desk for focused work,
                        a meeting room for your team, or a professional
                        office for the day, we help you discover the
                        right environment without the hassle.
                    </p>

                    <p>
                        Our platform brings different workspaces together
                        in one place. Explore your options, compare
                        amenities, and choose a space that works with
                        your schedule. Spend less time searching and
                        more time doing what you do best.
                    </p>
                </div>
            </section>

            {/* MISSION SECTION */}
            <section className="mx-auto grid w-[88%] max-w-6xl items-center gap-12 pt-14 sm:gap-14 md:grid-cols-2 md:pt-16 lg:gap-20">
                <div className="relative mb-5">
                    <div className="h-[245px] overflow-hidden rounded-xl sm:h-[300px]">
                        <img
                            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1100&q=90"
                            alt="Beautiful modern coworking office"
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                    </div>

                    <div className="absolute -bottom-6 left-1/2 flex w-max max-w-[95%] -translate-x-1/2 items-center gap-3 rounded-xl bg-white px-5 py-3 shadow-lg">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0BC] text-xl">
                            ✳
                        </div>

                        <div>
                            <p className="text-xs font-bold sm:text-sm">
                                "Your space. Your way."
                            </p>
                            <p className="mt-1 text-[10px] text-[#77746D]">
                                Find your place to thrive
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <span className="mb-3 block text-[10px] font-bold tracking-[2px] text-text-secondary">
                        OUR MISSION
                    </span>

                    <h2 className="max-w-lg text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
                        We empower people to work their way
                    </h2>

                    <p className="mt-5 text-xs leading-6 text-[#77746D] sm:text-[13px]">
                        Great work can happen anywhere. We believe
                        everyone deserves access to a space that
                        supports their goals, whether they are
                        freelancers, entrepreneurs, or growing teams.
                    </p>

                    <p className="mt-3 text-xs leading-6 text-[#77746D] sm:text-[13px]">
                        We make workspace discovery and booking
                        convenient, flexible, and accessible so you
                        can focus on the work that matters.
                    </p>

                    <blockquote className="mt-5 border-l-[3px] border-primary py-2 pl-4 text-xs italic leading-6 text-[#555148]">
                        Every great idea deserves a space where
                        it can grow.
                    </blockquote>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="relative mx-auto w-[88%] max-w-6xl pb-16 pt-24 sm:pb-20 sm:pt-28">
                <span className="absolute right-[10%] top-24 text-3xl">
                    ✧
                </span>

                <span className="absolute left-[5%] top-40 text-2xl">
                    ✣
                </span>

                <div className="mx-auto max-w-lg text-center">
                    <span className="mb-3 block text-[10px] font-bold tracking-[2px] text-text-secondary">
                        WHY CHOOSE US
                    </span>

                    <h2 className="text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
                        Make room for
                        <br />
                        better work
                    </h2>

                    <p className="mx-auto mt-4 max-w-md text-xs leading-6 text-[#77746D] sm:text-[13px]">
                        The right environment can change the way
                        you work. We help you find it.
                    </p>
                </div>

                <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-6">
                    {features.map((feature, index) => (
                        <article
                            key={feature.title}
                            className="group text-center transition-transform duration-300 hover:-translate-y-1"
                        >
                            <div className="relative mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-primary text-white text-3xl transition-transform duration-300 group-hover:rotate-6">
                                <h6 className="text-white">{feature.icon}</h6>

                                <span className="absolute -right-1 top-0 text-[10px] font-bold text-[#82703B]">
                                    0{index + 1}
                                </span>
                            </div>

                            <h3 className="text-sm font-medium sm:text-base">
                                {feature.title}
                            </h3>

                            <p className="mx-auto mt-3 max-w-[280px] text-xs leading-6 text-[#77746D]">
                                {feature.description}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}