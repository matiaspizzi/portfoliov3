import under_construction from '../assets/gifs/under_construction.gif';

export function ContactSection() {
  return (
    <div className="relative h-screen flex flex-col items-center justify-center z-10 gap-4">
      <p className="uppercase tracking-widest font-light text-2xl">Contact</p>
      <img src={under_construction} alt="Under construction" />
    </div>
  )
}