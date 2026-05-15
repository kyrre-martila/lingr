export const clone = (value) => JSON.parse(JSON.stringify(value))

export const createSessionLabel = ({ weekday, paceLabel, totalIntroductions }) =>
  `${weekday} ${paceLabel} · ${totalIntroductions} meaningful introductions`
