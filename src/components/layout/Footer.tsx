
import { Link } from "react-router-dom";
import { Github, Twitter, MessageCircle } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="Consentra" 
            className="h-6 w-6"
          />
          <span className="text-sm font-medium">
            © {new Date().getFullYear()} Consentra. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href="https://x.com/Consentra_DAO" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Follow us on X (Twitter)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href="https://t.me/consentra" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Telegram"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="sr-only">Telegram</span>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Join our Telegram community</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href="https://github.com/Consentra" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Explore our code on GitHub</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </footer>
  );
}
