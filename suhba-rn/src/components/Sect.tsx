import { Text } from 'react-native'
import { text } from '../theme/text'

export function Sect({ label }: { label: string }): React.JSX.Element {
  return <Text style={text.sect}>{label}</Text>
}
