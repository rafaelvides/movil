export const invoice_style = `
<style>
      .col-auto {
        grid-column: auto;
      }

      .col-span-1 {
        grid-column: span 1 / span 1;
      }

      .col-span-2 {
        grid-column: span 2 / span 2;
      }

      .col-span-3 {
        grid-column: span 3 / span 3;
      }

      .col-span-4 {
        grid-column: span 4 / span 4;
      }

      .col-span-5 {
        grid-column: span 5 / span 5;
      }

      .col-span-6 {
        grid-column: span 6 / span 6;
      }

      .col-span-7 {
        grid-column: span 7 / span 7;
      }

      .col-span-8 {
        grid-column: span 8 / span 8;
      }

      .col-span-9 {
        grid-column: span 9 / span 9;
      }

      .col-span-10 {
        grid-column: span 10 / span 10;
      }

      .col-span-11 {
        grid-column: span 11 / span 11;
      }

      .col-span-12 {
        grid-column: span 12 / span 12;
      }

      .grid {
        display: grid;
      }
      .grid-cols-1 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }

      .grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .grid-cols-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .grid-cols-5 {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }

      .grid-cols-6 {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }

      .grid-cols-7 {
        grid-template-columns: repeat(7, minmax(0, 1fr));
      }

      .grid-cols-8 {
        grid-template-columns: repeat(8, minmax(0, 1fr));
      }

      .grid-cols-9 {
        grid-template-columns: repeat(9, minmax(0, 1fr));
      }

      .grid-cols-10 {
        grid-template-columns: repeat(10, minmax(0, 1fr));
      }

      .grid-cols-11 {
        grid-template-columns: repeat(11, minmax(0, 1fr));
      }

      .grid-cols-12 {
        grid-template-columns: repeat(12, minmax(0, 1fr));
      }

      .flex {
        display: flex;
      }
      .flex-col {
        flex-direction: column;
      }
      .w-30 {
        width: 30%;
      }
      .w-70 {
        width: 70%;
      }
      .text-xss {
        font-size: 0.55rem; /* 12px */
        line-height: 1rem;
      }
      .text-xs {
        font-size: 0.6rem; /* 12px */
        line-height: 1rem;
      }

      .text-sm {
        font-size: 0.875rem; /* 14px */
        line-height: 0.5rem; /* 20px */
      }

      .text-base {
        font-size: 1rem; /* 16px */
        line-height: 1.5rem; /* 24px */
      }

      .text-lg {
        font-size: 1.125rem; /* 18px */
        line-height: 1.75rem; /* 28px */
      }

      .text-xl {
        font-size: 1.25rem; /* 20px */
        line-height: 1.75rem; /* 28px */
      }

      .text-2xl {
        font-size: 1.5rem; /* 24px */
        line-height: 2rem; /* 32px */
      }

      .text-3xl {
        font-size: 1.875rem; /* 30px */
        line-height: 2.25rem; /* 36px */
      }

      .text-4xl {
        font-size: 2.25rem; /* 36px */
        line-height: 2.5rem; /* 40px */
      }

      .text-5xl {
        font-size: 3rem; /* 48px */
        line-height: 1;
      }

      .text-6xl {
        font-size: 3.75rem; /* 60px */
        line-height: 1;
      }

      .text-7xl {
        font-size: 4.5rem; /* 72px */
        line-height: 1;
      }

      .text-8xl {
        font-size: 6rem; /* 96px */
        line-height: 1;
      }

      .text-9xl {
        font-size: 8rem; /* 128px */
        line-height: 1;
      }
      .justify-normal {
        justify-content: normal;
      }

      .justify-start {
        justify-content: flex-start;
      }

      .justify-end {
        justify-content: flex-end;
      }

      .justify-center {
        justify-content: center;
      }

      .justify-between {
        justify-content: space-between;
      }

      .justify-around {
        justify-content: space-around;
      }

      .justify-evenly {
        justify-content: space-evenly;
      }

      .justify-stretch {
        justify-content: stretch;
      }
      .justify-items-start {
        justify-items: start;
      }

      .justify-items-end {
        justify-items: end;
      }

      .justify-items-center {
        justify-items: center;
      }

      .justify-items-stretch {
        justify-items: stretch;
      }
      .w-screen {
        width: 100vw;
      }
      .h-screen {
        height: 100vh;
      }
      .w-full {
        width: 100%;
      }
      .h-full {
        height: 100%;
      }
      .place-items-start {
        place-items: start;
      }

      .place-items-end {
        place-items: end;
      }

      .place-items-center {
        place-items: center;
      }

      .place-items-baseline {
        place-items: baseline;
      }

      .place-items-stretch {
        place-items: stretch;
      }
      .font-thin {
        font-weight: 100;
      }

      .font-extralight {
        font-weight: 200;
      }

      .font-light {
        font-weight: 300;
      }

      .font-normal {
        font-weight: 400;
      }

      .font-medium {
        font-weight: 500;
      }

      .font-semibold {
        font-weight: 600;
      }

      .font-bold {
        font-weight: 700;
      }

      .font-extrabold {
        font-weight: 800;
      }

      .font-black {
        font-weight: 900;
      }

      .rounded-sm {
        border-radius: 0.125rem; /* 2px */
      }

      .rounded {
        border-radius: 0.25rem; /* 4px */
      }

      .border {
        border: 1px solid #000 !important;
      }

      .border-l {
        border-left: 1px solid #000 !important;
      }
      .border-t {
        border-top: 1px solid #000 !important;
      }
      .border-r {
        border-right: 1px solid #000 !important;
      }
      .border-b {
        border-bottom: 1px solid #000 !important;
      }

      .rounded-md {
        border-radius: 0.375rem; /* 6px */
      }

      .rounded-lg {
        border-radius: 0.5rem; /* 8px */
      }

      .rounded-xl {
        border-radius: 0.75rem; /* 12px */
      }

      .rounded-2xl {
        border-radius: 1rem; /* 16px */
      }

      .rounded-3xl {
        border-radius: 1.5rem; /* 24px */
      }

      .rounded-full {
        border-radius: 9999px; /* Círculo */
      }

      .items-start {
        align-items: flex-start;
      }

      .items-end {
        align-items: flex-end;
      }

      .items-center {
        align-items: center;
      }

      .items-baseline {
        align-items: baseline;
      }

      .items-stretch {
        align-items: stretch;
      }

      p {
        margin-bottom: 0 !important;
      }
    </style>
`;
