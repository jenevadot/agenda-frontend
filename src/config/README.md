# Configuración de Contacto

Este archivo contiene la información de contacto de la empresa que se muestra en el modal "Comunícate con nosotros" del landing page.

## Archivo: `contacto.ts`

### Campos configurables:

- **email**: Correo electrónico de contacto principal
- **telefono**: Número de teléfono en formato internacional (+51 XXX XXX XXX)
- **whatsapp**: Número de WhatsApp sin espacios ni símbolos (solo dígitos con código de país)
- **horarioAtencion**: Horario de atención al cliente (opcional, no se muestra actualmente)
- **mensajeRegistroNegocio**: Mensaje que se muestra en el modal de contacto

### Cómo actualizar:

1. Editar el archivo `/src/config/contacto.ts`
2. Actualizar los valores necesarios
3. Guardar el archivo
4. Reiniciar el servidor de desarrollo si está corriendo

### Ejemplo:

```typescript
export const CONTACTO_CONFIG = {
  email: 'info@miempresa.com',
  telefono: '+51 987 654 321',
  whatsapp: '51987654321',
  horarioAtencion: 'Lunes a Sábado, 8:00 AM - 8:00 PM',
  mensajeRegistroNegocio: 'Contáctanos para registrar tu negocio...'
} as const;
```

### Dónde se usa:

- **ModalContactoNegocio.tsx**: Modal que se abre al hacer click en "Comunícate con nosotros" en la tarjeta "Para Negocios" del landing page.
