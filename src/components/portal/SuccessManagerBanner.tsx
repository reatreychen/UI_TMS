import Image from "next/image";

const OFFICE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDIE5PAVmt108p5loJvYi7I9b6iifGKvqML06y-o1xZgnc_LVchd2ScGfI0X3bH_8Ihsx2SxaHUAFGMdeltS2tx4E2VW49wGdnxCj58JvV1u0U5KglH1JvUMFMqoy5GfDMap_rUsHt8ybNHW772-VZ8iREy8RI-AutvgTxjqmP5vpxGufk6Y53t1cTph_bh9wzv-E9QNbahWpS_82luUm_cnZhocd4m-smvoxkcVxqLL-Prb7WaLKWxzA38q_fMZtyWBJ2uD185vC_M";

export function SuccessManagerBanner() {
  return (
    <section className="px-container-margin py-20">
      <div className="group relative mx-auto h-[400px] max-w-[1440px] overflow-hidden rounded-3xl">
        <Image
          src={OFFICE_IMAGE}
          alt="Modern office architecture"
          fill
          className="object-cover opacity-30 grayscale transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-primary/80 to-transparent p-stack-lg">
          <div className="max-w-md text-on-primary">
            <h3 className="mb-stack-md text-display font-bold">
              Dedicated Enterprise Success
            </h3>
            <p className="mb-stack-lg text-body-lg opacity-90">
              Every Enterprise account is paired with a dedicated Account Manager
              to ensure your operations never slow down.
            </p>
            <a href="#" className="font-bold underline text-label-md">
              Learn about dedicated success managers
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
