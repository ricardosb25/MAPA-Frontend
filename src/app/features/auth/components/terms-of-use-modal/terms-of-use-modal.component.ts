import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export const TERMS_OF_USE_VERSION = '1.0';

export interface TermsSection {
  readonly title: string;
  readonly text: string;
}

const TERMS_SECTIONS: readonly TermsSection[] = [
  {
    title: '1. Objeto',
    text: 'O MAPA (Motor Analysis & Performance Academy) é uma plataforma educacional destinada ao estudo de motores, mapas de injeção e ECU, disponibilizando catálogo de motores, calibragem de ECU e dinamômetro virtual. Estes Termos regulam o uso da plataforma e a proteção dos seus dados pessoais.'
  },
  {
    title: '2. Dados pessoais tratados',
    text: 'Para viabilizar a conta, tratamos: nome completo, e-mail, perfil declarado (professor ou aluno) e a senha (armazenada de forma criptografada e nunca exibida). Também são armazenados os conteúdos que você criar na plataforma (motores, mapas e configurações de ECU) e registros técnicos de auditoria associados à sua conta.'
  },
  {
    title: '3. Finalidade e base legal',
    text: 'Tratamos esses dados para criar e autenticar sua conta, personalizar a experiência, garantir a segurança da plataforma e atender obrigações legais. A base legal é o seu consentimento (art. 7º, I, e art. 8º da Lei nº 13.709/2018 — LGPD), manifestado de forma livre, informada e inequívoca ao marcar a caixa de aceite neste cadastro. A recusa impede a criação da conta.'
  },
  {
    title: '4. Compartilhamento',
    text: 'Não vendemos nem divulgamos seus dados pessoais. O compartilhamento ocorre apenas com provedores de infraestrutura (hospedagem do sistema, banco de dados e envio de e-mails transacionais) e quando exigido por obrigação judicial ou autoridade competente.'
  },
  {
    title: '5. Retenção e eliminação',
    text: 'Seus dados são mantidos enquanto a conta estiver ativa. Ao solicitar a exclusão da conta, os dados pessoais serão eliminados ou anonimizados, ressalvadas as hipóteses legais de conservação (art. 16 da LGPD). Os registros de auditoria preservam apenas informações necessárias à rastreabilidade.'
  },
  {
    title: '6. Seus direitos como titular',
    text: 'Nos termos do art. 18 da LGPD, você pode: confirmar a existência de tratamento; acessar os dados; corrigir dados incompletos ou desatualizados; solicitar anonimização, bloqueio ou eliminação; solicitar a portabilidade; obter informações sobre compartilhamentos; e revogar o consentimento a qualquer momento (o que não afeta a licitude do tratamento anterior).'
  },
  {
    title: '7. Segurança',
    text: 'Adotamos medidas técnicas e organizacionais proporcionais ao risco, incluindo senhas criptografadas, autenticação por token e controle de acesso por perfil. Ainda assim, nenhum sistema é 100% seguro: use uma senha única e não compartilhe suas credenciais.'
  },
  {
    title: '8. Alterações destes termos',
    text: 'Estes termos podem ser atualizados em função da evolução da plataforma ou da legislação. Alterações relevantes serão comunicadas e passarão a valer a partir da nova versão, com pedido de novo aceite quando exigido. A versão aceita por você fica registrada no seu cadastro.'
  },
  {
    title: '9. Contato do controlador',
    text: 'Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, utilize o canal de suporte do projeto MAPA (contato informado pelo administrador da plataforma).'
  }
];

@Component({
  selector: 'app-terms-of-use-modal',
  standalone: true,
  imports: [CommonModule],
  host: {
    '(document:keydown.escape)': 'handleClose()'
  },
  template: `
    <div class="terms-backdrop" (click)="handleBackdropClick($event)">
      <div class="terms-card" role="dialog" aria-modal="true" aria-labelledby="termsOfUseModalTitle">
        <header class="terms-header">
          <div class="terms-header-text">
            <span class="terms-tag">TERMOS DE USO</span>
            <h2 class="terms-title" id="termsOfUseModalTitle">Termos de Uso e Privacidade do MAPA</h2>
            <p class="terms-version">Versão {{ termsVersion }} — vigente a partir do aceite no cadastro</p>
          </div>
          <button type="button" class="terms-close-button" (click)="handleClose()" aria-label="Fechar termos de uso">
            <i class="pi pi-times"></i>
          </button>
        </header>

        <div class="terms-body">
          @for (section of sections; track section.title) {
            <section class="terms-section">
              <h3 class="terms-section-title">{{ section.title }}</h3>
              <p class="terms-section-text">{{ section.text }}</p>
            </section>
          }
        </div>

        <footer class="terms-footer">
          <button type="button" class="terms-acknowledge-button" (click)="handleClose()">
            <i class="pi pi-check"></i>
            <span>Entendi</span>
          </button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .terms-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 1000;
    }

    .terms-card {
      width: 100%;
      max-width: 640px;
      background-color: #ffffff;
      border-radius: 14px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
      display: flex;
      flex-direction: column;
      max-height: 88vh;
      overflow: auto;
    }

    .terms-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 22px 24px 16px 24px;
      border-bottom: 1px solid #e2e8f0;
    }

    .terms-tag {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #0284c7;
      background-color: #e0f2fe;
      border-radius: 6px;
      padding: 4px 8px;
      margin-bottom: 8px;
    }

    .terms-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .terms-version {
      font-size: 0.8rem;
      color: #64748b;
      margin: 6px 0 0 0;
    }

    .terms-close-button {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease;
    }

    .terms-close-button:hover {
      color: #0f172a;
    }

    .terms-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .terms-section-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px 0;
    }

    .terms-section-text {
      font-size: 0.85rem;
      line-height: 1.55;
      color: #475569;
      margin: 0;
    }

    .terms-footer {
      display: flex;
      justify-content: flex-end;
      padding: 16px 24px 22px 24px;
      border-top: 1px solid #e2e8f0;
      position: sticky;
      bottom: 0;
      background-color: #ffffff;
    }

    .terms-acknowledge-button {
      height: 42px;
      padding: 0 18px;
      border: none;
      border-radius: 10px;
      background-color: #0099ff;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s ease;
    }

    .terms-acknowledge-button:hover {
      background-color: #0088e6;
    }
  `]
})
export class TermsOfUseModalComponent {
  @Output() close = new EventEmitter<void>();

  readonly termsVersion = TERMS_OF_USE_VERSION;
  readonly sections: readonly TermsSection[] = TERMS_SECTIONS;

  handleClose(): void {
    this.close.emit();
  }

  handleBackdropClick(mouseEvent: MouseEvent): void {
    if (mouseEvent.target === mouseEvent.currentTarget) {
      this.handleClose();
    }
  }
}
