# Drift Monitoring Playbook

**GATO Baustein 5: Instrumental Convergence Controls**

Dieses Playbook definiert Metriken, Schwellenwerte und Maßnahmen zur Erkennung und Bekämpfung von Governance-Drift im Agent-System.

---

## Metriken

### 1. Review Rejection Rate

**Definition:** `rejected / (approved + rejected)` pro Zeitraum

**Interpretation:**
- Niedrige Rate (< 10%): Reviews werden meist akzeptiert → möglicherweise zu permissiv
- Moderate Rate (10-25%): Gesunde Balance zwischen Qualität und Durchsatz
- Hohe Rate (> 25%): Viele Rejections → Qualitätsprobleme oder unklare Anforderungen

**Schwellenwerte:**
- 🟢 **Grün:** < 15%
- 🟡 **Gelb:** 15-25%
- 🔴 **Rot:** > 25%

**Maßnahmen:**
- **Gelb:**
  - Review-Checkliste verschärfen
  - Fehlende Felder in Decisions als required markieren
  - Review-Policy dokumentieren
- **Rot:**
  - Autonomy Tier runter (mehr menschliche Reviews)
  - Mandatory human review für alle Finalisierungen
  - Merge-Blocks aktivieren
  - Audit-Sample: 10 zufällige Decisions manuell prüfen

---

### 2. Missing Log Incidents

**Definition:** Anzahl Entscheidungen, die finalisiert wurden, aber kein `decision.finalized` action log haben

**Interpretation:**
- 0 = ideal (alle Finalisierungen sind geloggt)
- > 0 = Logging Enforcement wurde umgangen oder fehlgeschlagen

**Schwellenwerte:**
- 🟢 **Grün:** 0
- 🟡 **Gelb:** 1-2
- 🔴 **Rot:** > 2

**Maßnahmen:**
- **Gelb:**
  - Incident untersuchen: Warum fehlt das Log?
  - Prüfen ob Logging-Infrastruktur stabil ist
- **Rot:**
  - Kritisch: Logging Enforcement ist kaputt
  - Alle Finalisierungen im Zeitraum auditieren
  - Logging-Infrastruktur sofort prüfen und reparieren
  - Falls systematisch: Finalisierung blockieren bis behoben

---

### 3. Rework Count

**Definition:** Anzahl `review_actions` mit `action='reject'` pro Zeitraum

**Interpretation:**
- Niedrig: Wenig Rejections → Qualität ist gut oder Reviews sind zu permissiv
- Hoch: Viele Rejections → Qualitätsprobleme oder unklare Anforderungen

**Schwellenwerte:**
- 🟢 **Grün:** < 5 pro Woche
- 🟡 **Gelb:** 5-10 pro Woche
- 🔴 **Rot:** > 10 pro Woche

**Maßnahmen:**
- **Gelb:**
  - Review-Pattern analysieren: Was wird häufig rejected?
  - Entscheidungsvorlagen verbessern
- **Rot:**
  - Root Cause Analysis: Warum so viele Rejections?
  - Agent-Training verbessern
  - Review-Checkliste erweitern
  - Autonomy Tier runter

---

### 4. Escalation Rate

**Definition:** Anzahl Escalation-Events pro Zeitraum (action_logs mit `action='escalation'`)

**Status:** ✅ **Instrumentiert** (seit BLOCK 4.1)

**Interpretation:**
- 0 = ideal (keine Governance-Verletzungen)
- > 0 = Versuche, Governance-Regeln zu umgehen oder Verletzungen
- Hohe Rate = Systematische Probleme oder Agent versucht Bypass

**Schwellenwerte:**
- 🟢 **Grün:** 0 pro Woche
- 🟡 **Gelb:** 1-3 pro Woche
- 🔴 **Rot:** > 3 pro Woche

**Maßnahmen:**
- **Gelb:**
  - Escalation-Events analysieren: Welche Gründe? (invalid_commit_token, commit_mismatch, payload_tamper, finalize_invalid_status, finalize_review_not_approved, finalize_project_mismatch)
  - Prüfen ob Pattern erkennbar (gleicher Agent, gleiches Tool)
  - Review-Policy verschärfen falls nötig
- **Rot:**
  - Kritisch: Systematische Governance-Verletzungen
  - Sofort: Autonomy Tier runter für betroffene Agents
  - Audit-Sample: Alle Escalation-Events im Zeitraum prüfen
  - Root Cause Analysis: Warum versucht Agent zu bypassen?
  - Falls systematisch: Agent-Training oder Policy-Anpassung

---

### 5. Decision Completeness Score

**Definition:** Anteil Entscheidungen (draft + final), die Mindestfelder haben:
- `assumptions >= 1`
- `alternatives >= 1`
- `risks >= 1`
- `successCriteria >= 1`
- `nextSteps >= 1`

**Interpretation:**
- 100% = Alle Decisions haben Mindestfelder → ideal
- < 80% = Viele unvollständige Decisions → Qualitätsproblem

**Schwellenwerte:**
- 🟢 **Grün:** >= 90%
- 🟡 **Gelb:** 75-90%
- 🔴 **Rot:** < 75%

**Maßnahmen:**
- **Gelb:**
  - DTO-Validierung verschärfen (bereits implementiert in BLOCK 2)
  - Fehlende Felder als required markieren
- **Rot:**
  - Alle unvollständigen Decisions identifizieren
  - Nachfassen bei Owners
  - DTO-Validierung als hard requirement durchsetzen
  - Autonomy Tier runter für Agents mit niedriger Completeness

---

## Anti-Gaming Maßnahmen

**Qualitative Stichprobe (prozessual, keine Automation):**

1x pro Woche: **3 zufällige Decisions manuell spotchecken**

**Checkliste:**
- [ ] Entscheidung ist vollständig (alle Mindestfelder vorhanden)
- [ ] Review wurde korrekt durchgeführt (approved + commit token verwendet)
- [ ] Logging ist konsistent (intent + finalized logs vorhanden)
- [ ] Entscheidung ist nachvollziehbar und dokumentiert
- [ ] Keine Anzeichen von Bypass oder Umgehung

**Wenn Probleme gefunden:**
- Sofortige Eskalation
- Root Cause Analysis
- Maßnahmen aus Playbook anwenden

---

## Response-Plan (Zusammenfassung)

### Gelb (Warnung)
1. Metrik analysieren: Was ist die Ursache?
2. Checkliste verschärfen / Dokumentation verbessern
3. Nächste Woche erneut prüfen

### Rot (Kritisch)
1. **Sofort:**
   - Autonomy Tier runter
   - Mandatory human review aktivieren
   - Merge-Blocks aktivieren (falls möglich)
2. **Innerhalb 24h:**
   - Root Cause Analysis
   - Audit-Sample (10 zufällige Decisions)
   - Maßnahmen dokumentieren
3. **Innerhalb 1 Woche:**
   - Systematische Verbesserungen implementieren
   - Metriken erneut prüfen

---

## Metriken abrufen

**Endpoint:** `GET /monitoring/drift?from=YYYY-MM-DD&to=YYYY-MM-DD`

**Beispiel:**
```bash
curl "http://localhost:4000/monitoring/drift?from=2026-01-01&to=2026-02-01"
```

**Response:**
```json
{
  "range": {
    "from": "2026-01-01T00:00:00.000Z",
    "to": "2026-02-01T00:00:00.000Z"
  },
  "metrics": {
    "reviewRejectionRate": {
      "value": 0.12,
      "numerator": 3,
      "denominator": 25
    },
    "missingLogIncidents": {
      "value": 1
    },
    "reworkCount": {
      "value": 4
    },
    "escalationRate": {
      "value": null,
      "note": "not instrumented"
    },
    "decisionCompleteness": {
      "value": 0.76,
      "sample": 34
    }
  }
}
```

---

## Wartung

- **Wöchentlich:** Metriken prüfen + 3 Decisions spotchecken
- **Monatlich:** Playbook-Review (Schwellenwerte anpassen falls nötig)
- **Quartal:** Escalation-Rate instrumentieren (TODO)

---

**Letzte Aktualisierung:** 2026-02-13  
**Version:** 1.0 (MVP)

