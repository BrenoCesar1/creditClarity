'use client';

import type { Card as CardType, Transaction } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';

const CardLogo = ({ brand }: { brand: CardType['brand'] }) => {
  const logos = {
    visa: '/assets/visa.svg',
    mastercard: '/assets/mastercard.svg',
    amex: '/assets/amex.svg',
    elo: '/assets/elo.svg',
  };

  const logoPath = logos[brand];
  
  // A simple SVG placeholder if the logo is not found
  const placeholderSvg = (
    <svg width="60" height="40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className="rounded-md bg-gray-200">
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#666" fontSize="10">{brand}</text>
    </svg>
  );
  
  if (!logoPath) {
    return placeholderSvg;
  }

  // Unfortunately next/image doesn't support SVGs from local files very well without configuration.
  // Using <img> for simplicity here. In a real app, you might use a loader or inline the SVG.
  // The provided code doesn't have local SVGs, so I will make them inline.

  const svgs = {
    visa: <svg xmlns="http://www.w3.org/2000/svg" width="64" height="40" viewBox="0 0 64 20"><path fill="#1A1F71" d="M21.234 4.143h-4.329l-2.61 11.594h4.525l.613-2.834h2.946l.373 2.834h4.349L26.553 4.143h-5.319zm-1.01 6.314l.943-4.432l.943 4.432h-1.886zM38.832 4.143l-3.35 11.594h4.329l3.35-11.594h-4.329zM45.19 4.143h-4.525l-4.73 11.594h4.525l4.73-11.594zM50.013 11.45l.556-2.583c.097-.563.489-1.02.922-1.252l2.36-.612v-.223c0-2.34-2.85-3.64-5.525-3.64-2.457 0-5.32 1.3-5.32 3.863 0 .786.536 1.34 1.15 1.572l3.865 1.417c.536.16.825.462.825.86 0 .612-.922.952-1.943.952-1.613 0-2.31-.32-2.31-.32l-.468 2.388c.057.038.9.377 2.753.377 2.926 0_5.163-1.31 5.163-3.766 0-.85-.45-1.533-1.517-1.91zM11.93 4.417c-.33-.29-3.23-1.427-5.52-1.427C2.31 3 .02 5.097.02 7.79c0 2.227 2.112 3.483 3.962 4.21l1.17.483c.727.31 1.15.748 1.15 1.427 0 .973-1.284 1.487-2.733 1.487-1.593 0-2.732-.423-2.732-.423l-.613 2.68c.02.02 1.285.58 3.46.58 4.078 0 6.55-2.264 6.55-5.26 0-2.812-2.592-4.13-4.6-4.99l-.98-.383c-.63-.252-.98-.592-.98-1.143 0-.73.94-1.234 2.13-1.234 1.13 0 2.053.36 2.053.36l.518-2.52z"/></svg>,
    mastercard: <svg xmlns="http://www.w3.org/2000/svg" width="64" height="40" viewBox="0 0 213.7 132.3"><circle cx="66.2" cy="66.2" r="66.2" fill="#EA001B"/><circle cx="147.5" cy="66.2" r="66.2" fill="#F79E1B"/><path d="M106.8 66.2a66.2 66.2 0 0122.3-49.8 66.2 66.2 0 00-44.6 0 66.2 66.2 0 0122.3 49.8z" fill="#FF5F00"/></svg>,
    elo: <svg xmlns="http://www.w3.org/2000/svg" width="64" height="40" viewBox="0 0 100 60"><path fill="#00A1E0" d="M0 0h100v60H0z"/><path fill="#FFF" d="M22.5 19.4c-2 0-3.6.7-4.8 2s-1.8 3-1.8 5.1-.6 3.8-1.8 5.1-2.8 2-4.8 2h-1v4h21.4v-4h-1c-2 0-3.6-.7-4.8-2s-1.8-3-1.8-5.1.6-3.8 1.8-5.1 2.8-2 4.8-2h1v-4H22.5zm31 0c-2 0-3.6.7-4.8 2s-1.8 3-1.8 5.1-.6 3.8-1.8 5.1-2.8 2-4.8 2h-1v4h21.4v-4h-1c-2 0-3.6-.7-4.8-2s-1.8-3-1.8-5.1.6-3.8 1.8-5.1 2.8-2 4.8-2h1v-4H53.5zm31.1 0c-2 0-3.6.7-4.8 2s-1.8 3-1.8 5.1-.6 3.8-1.8 5.1-2.8 2-4.8 2h-1v4h21.4v-4h-1c-2 0-3.6-.7-4.8-2s-1.8-3-1.8-5.1.6-3.8 1.8-5.1 2.8-2 4.8-2h1v-4H84.6z"/></svg>,
    amex: <svg xmlns="http://www.w3.org/2000/svg" width="64" height="40" viewBox="0 0 200 124"><path fill="#006FCF" d="M0 0h200v124H0z"/><path fill="none" stroke="#FFF" stroke-width="8" d="M100 19v86M32 62h136"/><path fill="#FFF" d="M100 62L66 32v60zm0 0l34-30v60z"/></svg>,
  }

  return svgs[brand] || placeholderSvg;
};

export function CardsSummary({ cards, transactions }: { cards: CardType[]; transactions: Transaction[] }) {
  
  const getCardTotal = (cardId: string) => {
    return transactions
      .filter((t) => t.cardId === cardId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Cartões</CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel
          opts={{
            align: 'start',
          }}
          className="w-full"
        >
          <CarouselContent>
            {cards.map((card, index) => (
              <CarouselItem key={index} className="md:basis-1/2">
                <div className="p-1">
                  <div className="rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground p-6 flex flex-col justify-between h-48 shadow-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-lg">{card.name}</span>
                       <CardLogo brand={card.brand} />
                    </div>
                    <div className="text-right">
                       <p className="text-sm opacity-80">Gasto no Mês</p>
                       <p className="text-2xl font-bold tracking-wider">
                         R$ {getCardTotal(card.id).toFixed(2)}
                       </p>
                       <p className="text-lg font-mono tracking-widest mt-2">
                        •••• {card.last4}
                       </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
