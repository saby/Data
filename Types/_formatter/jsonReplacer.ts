/// <amd-module name="Types/_formatter/jsonReplacer" />
export default function jsonReplacer(name: string, value: any) {
   if (value === Infinity) {
      return {
         $serialized$: '+inf'
      };
   } else if (value === -Infinity) {
      return {
         $serialized$: '-inf'
      };
   }
   else if (value === undefined) {
      return {
         $serialized$: 'undef'
      };
   }//@ts-ignore
   else if (Number.isNaN(value)) {
      return {
         $serialized$: 'NaN'
      };
   }

   return value;
}
