// DATOS DE EJEMPLO (anonimizados) — NO son clientas reales.
// Nombres/códigos ficticios; la estructura financiera se conserva para la demo de la UI.
// En producción estos datos vienen de la API (ver src/pages/Finanzas/API_CONTRACT.md y
// src/services/finanzas.service.ts → USE_MOCK).
import { FinanzasSeed } from "@/interfaces/finanzas"

const seed: FinanzasSeed = {
  "clients": [
    {
      "id": "DEMO0001",
      "name": "Clienta Demo 001",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0002",
      "name": "Clienta Demo 002",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 7,
      "balance": 0,
      "fixedPayment": 199.0,
      "payments": {
        "enero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 199.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0003",
      "name": "Clienta Demo 003",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 7,
      "balance": 0,
      "fixedPayment": 199.0,
      "payments": {
        "enero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 199.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0004",
      "name": "Clienta Demo 004",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 7,
      "balance": 199.0,
      "fixedPayment": 199.0,
      "payments": {
        "enero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 199.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 398.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0005",
      "name": "Clienta Demo 005",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 10,
      "balance": 0,
      "fixedPayment": 199.0,
      "payments": {
        "enero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 199.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0006",
      "name": "Clienta Demo 006",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 10,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0007",
      "name": "Clienta Demo 007",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 17,
      "balance": 199.0,
      "fixedPayment": 199.0,
      "payments": {
        "enero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 398.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 398.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0008",
      "name": "Clienta Demo 008",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 199.0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 199.0,
          "status": "Retraso"
        },
        "marzo": {
          "amount": 199.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 199.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0009",
      "name": "Clienta Demo 009",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Bloqueado",
      "reports": null,
      "notes": "",
      "paymentDay": null,
      "balance": 199.0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 199.0,
          "status": "Retraso"
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0010",
      "name": "Clienta Demo 010",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 3,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0011",
      "name": "Clienta Demo 011",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0012",
      "name": "Clienta Demo 012",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 1,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0013",
      "name": "Clienta Demo 013",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0014",
      "name": "Clienta Demo 014",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 349.0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 650.0,
          "status": "Retraso"
        },
        "febrero": {
          "amount": 1000.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 798.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 798.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0015",
      "name": "Clienta Demo 015",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 449.0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 898.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 898.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0016",
      "name": "Clienta Demo 016",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 449.0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 898.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0017",
      "name": "Clienta Demo 017",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 449.0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 450.0,
          "status": "Retraso"
        },
        "marzo": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 898.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0018",
      "name": "Clienta Demo 018",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 6,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0019",
      "name": "Clienta Demo 019",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 0.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0020",
      "name": "Clienta Demo 020",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 8,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0021",
      "name": "Clienta Demo 021",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 12,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 450.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0022",
      "name": "Clienta Demo 022",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 17,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0023",
      "name": "Clienta Demo 023",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 19,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 900.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 449.0,
          "status": "Retraso"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0024",
      "name": "Clienta Demo 024",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 450.0,
      "payments": {
        "enero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0025",
      "name": "Clienta Demo 025",
      "plan": null,
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 450.0,
      "payments": {
        "enero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0026",
      "name": "Clienta Demo 026",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 1,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0027",
      "name": "Clienta Demo 027",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 1,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0028",
      "name": "Clienta Demo 028",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 1,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0029",
      "name": "Clienta Demo 029",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 1,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0030",
      "name": "Clienta Demo 030",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 1,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0031",
      "name": "Clienta Demo 031",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 1,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0032",
      "name": "Clienta Demo 032",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 1,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0033",
      "name": "Clienta Demo 033",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 1,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0034",
      "name": "Clienta Demo 034",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 1,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0035",
      "name": "Clienta Demo 035",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 1,
      "balance": 349.0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 598.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Retraso"
        },
        "marzo": {
          "amount": 649.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 698.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 698.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0036",
      "name": "Clienta Demo 036",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 2,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0037",
      "name": "Clienta Demo 037",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 0.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0038",
      "name": "Clienta Demo 038",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 3,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0039",
      "name": "Clienta Demo 039",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 3,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0040",
      "name": "Clienta Demo 040",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 3,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0041",
      "name": "Clienta Demo 041",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 3,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0042",
      "name": "Clienta Demo 042",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 3,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0043",
      "name": "Clienta Demo 043",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 3,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0044",
      "name": "Clienta Demo 044",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 3,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0045",
      "name": "Clienta Demo 045",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Cargado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0046",
      "name": "Clienta Demo 046",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Cargado",
      "notes": "",
      "paymentDay": 3,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0047",
      "name": "Clienta Demo 047",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 3,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0048",
      "name": "Clienta Demo 048",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 3,
      "balance": 159.0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 608.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0049",
      "name": "Clienta Demo 049",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 698.0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 698.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0050",
      "name": "Clienta Demo 050",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 4,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0051",
      "name": "Clienta Demo 051",
      "plan": "Nacional",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 4,
      "balance": 0,
      "fixedPayment": 1099.0,
      "payments": {
        "enero": {
          "amount": 1044.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 1044.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 1099.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0052",
      "name": "Clienta Demo 052",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 4,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 598.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0053",
      "name": "Clienta Demo 053",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0054",
      "name": "Clienta Demo 054",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0055",
      "name": "Clienta Demo 055",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 300.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0056",
      "name": "Clienta Demo 056",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": null,
          "status": null
        },
        "febrero": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0057",
      "name": "Clienta Demo 057",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0058",
      "name": "Clienta Demo 058",
      "plan": "Nacional",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 1099.0,
      "payments": {
        "enero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 1099.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0059",
      "name": "Clienta Demo 059",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0060",
      "name": "Clienta Demo 060",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0061",
      "name": "Clienta Demo 061",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0062",
      "name": "Clienta Demo 062",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0063",
      "name": "Clienta Demo 063",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0064",
      "name": "Clienta Demo 064",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0065",
      "name": "Clienta Demo 065",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0066",
      "name": "Clienta Demo 066",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 300.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0067",
      "name": "Clienta Demo 067",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": null,
          "status": null
        },
        "febrero": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0068",
      "name": "Clienta Demo 068",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": null,
          "status": null
        },
        "febrero": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0069",
      "name": "Clienta Demo 069",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0070",
      "name": "Clienta Demo 070",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0071",
      "name": "Clienta Demo 071",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0072",
      "name": "Clienta Demo 072",
      "plan": "Nacional",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0073",
      "name": "Clienta Demo 073",
      "plan": "Nacional",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 1099.0,
      "payments": {
        "enero": {
          "amount": 1044.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 1044.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 1099.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0074",
      "name": "Clienta Demo 074",
      "plan": "Nacional",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 1099.0,
      "payments": {
        "enero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 1099.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0075",
      "name": "Clienta Demo 075",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": null,
          "status": null
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0076",
      "name": "Clienta Demo 076",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": null,
          "status": null
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0077",
      "name": "Clienta Demo 077",
      "plan": "Nacional",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 1099.0,
      "payments": {
        "enero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 1099.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0078",
      "name": "Clienta Demo 078",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0079",
      "name": "Clienta Demo 079",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0080",
      "name": "Clienta Demo 080",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Cargado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": null,
          "status": null
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 0.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0081",
      "name": "Clienta Demo 081",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 349.0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 698.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0082",
      "name": "Clienta Demo 082",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 349.0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 300.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 698.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0083",
      "name": "Clienta Demo 083",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 449.0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 449.0,
          "status": "Retraso"
        },
        "marzo": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 898.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0084",
      "name": "Clienta Demo 084",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 969.0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 750.0,
          "status": "Retraso"
        },
        "febrero": {
          "amount": 1500.0,
          "status": "Retraso"
        },
        "marzo": {
          "amount": 2250.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 1938.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0085",
      "name": "Clienta Demo 085",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 98.0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 698.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 447.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0086",
      "name": "Clienta Demo 086",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 599.0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": null,
          "status": null
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": 649.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 948.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0087",
      "name": "Clienta Demo 087",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 349.0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0088",
      "name": "Clienta Demo 088",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 5,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": null,
          "status": null
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0089",
      "name": "Clienta Demo 089",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 6,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 450.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0090",
      "name": "Clienta Demo 090",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 6,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 598.0,
          "status": "Retraso"
        },
        "marzo": {
          "amount": 598.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0091",
      "name": "Clienta Demo 091",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 6,
      "balance": 1928.0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 2650.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 969.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 969.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 2897.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0092",
      "name": "Clienta Demo 092",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 7,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0093",
      "name": "Clienta Demo 093",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 7,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0094",
      "name": "Clienta Demo 094",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 7,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0095",
      "name": "Clienta Demo 095",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 7,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0096",
      "name": "Clienta Demo 096",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 7,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0097",
      "name": "Clienta Demo 097",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 8,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0098",
      "name": "Clienta Demo 098",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 8,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0099",
      "name": "Clienta Demo 099",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 8,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0100",
      "name": "Clienta Demo 100",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 8,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0101",
      "name": "Clienta Demo 101",
      "plan": "Nacional",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 8,
      "balance": 0,
      "fixedPayment": 1099.0,
      "payments": {
        "enero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 1099.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0102",
      "name": "Clienta Demo 102",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 8,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Retraso"
        },
        "marzo": {
          "amount": 1200.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0103",
      "name": "Clienta Demo 103",
      "plan": "Nacional",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 8,
      "balance": 0,
      "fixedPayment": 1099.0,
      "payments": {
        "enero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 1099.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0104",
      "name": "Clienta Demo 104",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 8,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Retraso"
        },
        "febrero": {
          "amount": 898.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0105",
      "name": "Clienta Demo 105",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 9,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 600.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0106",
      "name": "Clienta Demo 106",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 10,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0107",
      "name": "Clienta Demo 107",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 10,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0108",
      "name": "Clienta Demo 108",
      "plan": "Nacional",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 10,
      "balance": 0,
      "fixedPayment": 1099.0,
      "payments": {
        "enero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 1099.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0109",
      "name": "Clienta Demo 109",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 11,
      "balance": 0,
      "fixedPayment": 299.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 299.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0110",
      "name": "Clienta Demo 110",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 750.0,
          "status": "Retraso"
        },
        "febrero": {
          "amount": 1500.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 0.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0111",
      "name": "Clienta Demo 111",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 11,
      "balance": 998.0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Retraso"
        },
        "marzo": {
          "amount": 649.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 1347.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0112",
      "name": "Clienta Demo 112",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Pendiente",
      "notes": "",
      "paymentDay": 12,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0113",
      "name": "Clienta Demo 113",
      "plan": "Standard",
      "promo": null,
      "appStatus": "Activo",
      "reports": "No aplica",
      "notes": "",
      "paymentDay": 12,
      "balance": 0,
      "fixedPayment": 99.0,
      "payments": {
        "enero": {
          "amount": 99.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 99.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 99.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 99.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 99.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0114",
      "name": "Clienta Demo 114",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 12,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0115",
      "name": "Clienta Demo 115",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 13,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0116",
      "name": "Clienta Demo 116",
      "plan": "Nacional",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 14,
      "balance": 0,
      "fixedPayment": 1099.0,
      "payments": {
        "enero": {
          "amount": 1044.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 1044.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 1099.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0117",
      "name": "Clienta Demo 117",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 15,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0118",
      "name": "Clienta Demo 118",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 15,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 300.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0119",
      "name": "Clienta Demo 119",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 15,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 600.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0120",
      "name": "Clienta Demo 120",
      "plan": "Nacional",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 16,
      "balance": 0,
      "fixedPayment": 1099.0,
      "payments": {
        "enero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 899.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 1099.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 1099.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0121",
      "name": "Clienta Demo 121",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 16,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0122",
      "name": "Clienta Demo 122",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 17,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0123",
      "name": "Clienta Demo 123",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 17,
      "balance": 199.0,
      "fixedPayment": 199.0,
      "payments": {
        "enero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 199.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 199.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 398.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0124",
      "name": "Clienta Demo 124",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 17,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0125",
      "name": "Clienta Demo 125",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 18,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 300.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 349.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0126",
      "name": "Clienta Demo 126",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Cargado",
      "notes": "",
      "paymentDay": 18,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0127",
      "name": "Clienta Demo 127",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 20,
      "balance": 969.0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 2250.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 1938.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0128",
      "name": "Clienta Demo 128",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 21,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 659.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0129",
      "name": "Clienta Demo 129",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 21,
      "balance": 0,
      "fixedPayment": 449.0,
      "payments": {
        "enero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 449.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 449.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0130",
      "name": "Clienta Demo 130",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 22,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0131",
      "name": "Clienta Demo 131",
      "plan": "Elite",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 24,
      "balance": 0,
      "fixedPayment": 969.0,
      "payments": {
        "enero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 750.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": 969.0,
          "status": "Realizado"
        },
        "mayo": {
          "amount": 969.0,
          "status": "Realizado"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0132",
      "name": "Clienta Demo 132",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": 25,
      "balance": 698.0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": 698.0,
          "status": "Retraso"
        },
        "mayo": {
          "amount": 1047.0,
          "status": "Retraso"
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0133",
      "name": "Clienta Demo 133",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 659.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 500.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 659.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0134",
      "name": "Clienta Demo 134",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0135",
      "name": "Clienta Demo 135",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Realizado"
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0136",
      "name": "Clienta Demo 136",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": 349.0,
          "status": "Retraso"
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0137",
      "name": "Clienta Demo 137",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Retraso"
        },
        "febrero": {
          "amount": 598.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0138",
      "name": "Clienta Demo 138",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0139",
      "name": "Clienta Demo 139",
      "plan": null,
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 299.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Retraso"
        },
        "febrero": {
          "amount": 598.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0140",
      "name": "Clienta Demo 140",
      "plan": null,
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 299.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0141",
      "name": "Clienta Demo 141",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 599.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0142",
      "name": "Clienta Demo 142",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 199.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Retraso"
        },
        "febrero": {
          "amount": 399.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0143",
      "name": "Clienta Demo 143",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 299.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0144",
      "name": "Clienta Demo 144",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 299.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0145",
      "name": "Clienta Demo 145",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 299.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0146",
      "name": "Clienta Demo 146",
      "plan": "Ejecutivo",
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 599.0,
      "payments": {
        "enero": {
          "amount": 599.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0147",
      "name": "Clienta Demo 147",
      "plan": null,
      "promo": null,
      "appStatus": "Activo",
      "reports": "Automatizado",
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 299.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0148",
      "name": "Clienta Demo 148",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Inactivo",
      "reports": null,
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 299.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0149",
      "name": "Clienta Demo 149",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Inactivo",
      "reports": null,
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 349.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Retraso"
        },
        "febrero": {
          "amount": 299.0,
          "status": "Realizado"
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0150",
      "name": "Clienta Demo 150",
      "plan": "Básico",
      "promo": null,
      "appStatus": "Bloqueado",
      "reports": null,
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": 299.0,
      "payments": {
        "enero": {
          "amount": 299.0,
          "status": "Retraso"
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0151",
      "name": "Clienta Demo 151",
      "plan": null,
      "promo": null,
      "appStatus": null,
      "reports": null,
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 0.0,
          "status": null
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0152",
      "name": "Clienta Demo 152",
      "plan": null,
      "promo": null,
      "appStatus": null,
      "reports": null,
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 0.0,
          "status": null
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0153",
      "name": "Clienta Demo 153",
      "plan": null,
      "promo": null,
      "appStatus": null,
      "reports": null,
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 0.0,
          "status": null
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0154",
      "name": "Clienta Demo 154",
      "plan": null,
      "promo": null,
      "appStatus": null,
      "reports": null,
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 0.0,
          "status": null
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    },
    {
      "id": "DEMO0155",
      "name": "Clienta Demo 155",
      "plan": null,
      "promo": null,
      "appStatus": null,
      "reports": null,
      "notes": "",
      "paymentDay": null,
      "balance": 0,
      "fixedPayment": null,
      "payments": {
        "enero": {
          "amount": 0.0,
          "status": null
        },
        "febrero": {
          "amount": null,
          "status": null
        },
        "marzo": {
          "amount": null,
          "status": null
        },
        "abril": {
          "amount": null,
          "status": null
        },
        "mayo": {
          "amount": null,
          "status": null
        }
      },
      "reminderSentAt": null
    }
  ],
  "summary": [
    {
      "month": "enero",
      "Clientes totales": 144.0,
      "Ticket promedio": 462.1,
      "Retraso": 4143.0,
      "Pendiente": 0.0,
      "Ingreso": 62400.0,
      "Total": 66543.0,
      "Servidores": 3932.98,
      "ZOOM": 355.0,
      "Chat GPT": 1098.0,
      "Adobe": 1276.58,
      "Nexrender": 3761.4,
      "Canva": 175.0,
      "Gemini": 800.0,
      "GIF": 11398.96,
      "Diseñadora": 16100.0,
      "Programador": 10482.0,
      "Administración": 30000.0,
      "GD": 56582.0,
      "Gastos Totales": 67980.96,
      "Ingreso - GT": -5580.96,
      "Total - GT": -1437.96
    },
    {
      "month": "febrero",
      "Clientes totales": 139.0,
      "Ticket promedio": 478.67,
      "Retraso": 4842.0,
      "Pendiente": 0.0,
      "Ingreso": 61693.0,
      "Total": 66535.0,
      "Servidores": 3932.98,
      "ZOOM": 355.0,
      "Chat GPT": 1098.0,
      "Adobe": 1276.58,
      "Nexrender": 3761.4,
      "Canva": 175.0,
      "Gemini": 800.0,
      "GIF": 11398.96,
      "Diseñadora": 16100.0,
      "Programador": 10482.0,
      "Administración": 30000.0,
      "GD": 56582.0,
      "Gastos Totales": 67980.96,
      "Ingreso - GT": -6287.96,
      "Total - GT": -1445.96
    },
    {
      "month": "marzo",
      "Clientes totales": 136.0,
      "Ticket promedio": 536.92,
      "Retraso": 7055.0,
      "Pendiente": 0.0,
      "Ingreso": 65966.0,
      "Total": 73021.0,
      "Servidores": 3932.98,
      "ZOOM": 355.0,
      "Chat GPT": 1098.0,
      "Adobe": 1276.58,
      "Nexrender": 3761.4,
      "Canva": 175.0,
      "Gemini": 800.0,
      "GIF": 11398.96,
      "Diseñadora": 16100.0,
      "Programador": 10482.0,
      "Administración": 30000.0,
      "GD": 56582.0,
      "Gastos Totales": 67980.96,
      "Ingreso - GT": -2014.96,
      "Total - GT": 5040.04
    },
    {
      "month": "abril",
      "Clientes totales": 131.0,
      "Ticket promedio": 522.57,
      "Retraso": 10684.0,
      "Pendiente": 0.0,
      "Ingreso": 57773.0,
      "Total": 68457.0,
      "Servidores": 1771.25,
      "ZOOM": 355.0,
      "Chat GPT": 1098.0,
      "Adobe": 1276.58,
      "Nexrender": 3761.4,
      "Canva": 175.0,
      "Gemini": 800.0,
      "GIF": 9237.23,
      "Diseñadora": 16100.0,
      "Programador": 10482.0,
      "Administración": 30000.0,
      "GD": 56582.0,
      "Gastos Totales": 65819.23,
      "Ingreso - GT": -8046.23,
      "Total - GT": 2637.77
    },
    {
      "month": "mayo",
      "Clientes totales": 127.0,
      "Ticket promedio": 599.06,
      "Retraso": 23478.0,
      "Pendiente": 0.0,
      "Ingreso": 52603.0,
      "Total": 76081.0,
      "Servidores": 1771.25,
      "ZOOM": 355.0,
      "Chat GPT": 1098.0,
      "Adobe": 1276.58,
      "Nexrender": 8280.0,
      "Canva": 175.0,
      "Gemini": 800.0,
      "GIF": 13755.83,
      "Diseñadora": 16100.0,
      "Programador": 10482.0,
      "Administración": 30000.0,
      "GD": 56582.0,
      "Gastos Totales": 70337.83,
      "Ingreso - GT": -17734.83,
      "Total - GT": 5743.17
    }
  ],
  "generatedFrom": "datos de ejemplo (anonimizado)",
  "months": [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo"
  ]
}

export default seed
