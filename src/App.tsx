import React, { useState, useEffect } from 'react';    
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client';    
  
const client = new ApolloClient({    
  uri: 'https://countries.trevorblades.com/',    
  cache: new InMemoryCache()    
});    
  
const COUNTRIES_QUERY = gql`    
  query GetCountries {    
    countries {    
      code    
      name    
      native    
      capital    
      emoji    
      currency    
      languages {    
        code    
        name    
      }    
    }    
  }    
`;    
  
interface Language {    
  code: string;    
  name: string;    
}    
  
interface Country {    
  code: string;    
  name: string;    
  native: string;    
  capital: string;    
  emoji: string;    
  currency: string;    
  languages: Language[];    
} 

function parseSearchSize(i_: string) {  
  let search = i_.match(/search:(\w+)/);  
  let size = i_.match(/size:(\d+)/);  

  let result: any = {};  

  if (search && search.length > 1) {  
      result.search = search[1] == null ? "" : search[1];  
  }
  else {
      result.search = ""
  }

  if (size && size.length > 1) {  
      result.size = Number(size[1]) 
  }  
  else {
      result.size = 10
  }

  return result;  
}  



  
const App = () => {    
  const { loading, error, data } = useQuery<{ countries: Country[] }>(COUNTRIES_QUERY);    
  const [input, setInput] = useState('');    
  const [selected, setSelected] = useState<Country | null>(null);    
  const [color, setColor] = useState('#ffffff');  
  const[size, setSize] = useState(10);  
  const[prevInput, setPrevInput] = useState("")
  
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];    
  
  useEffect(() => {    
    if (data && input.includes('search:')) { 
      let parsed = parseSearchSize(input);    
      const searchTerm = parsed.search
      const size_ = parsed.size
      setSize(size_)
      const filtered = data.countries.filter((country: Country) => country.code.toLowerCase().includes(searchTerm.toLowerCase()) || country.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0,size_);    
      if(prevInput !== input) {
        const toSelect = filtered.length >= 10 ? filtered[9] : filtered[filtered.length - 1];    
        if (toSelect) {    
          setSelected(toSelect);    
          setColor(colors[toSelect.code.charCodeAt(0) % colors.length]);    
        }    
        setPrevInput(input) 
      }
    } else if (data) {  
      const filtered = data.countries.filter((country: Country) => country.name.toLowerCase().includes(input.toLowerCase()) || country.code.toLowerCase().includes(input.toLowerCase()));    
      if(prevInput !== input) {
        const toSelect = filtered.length >= 10 ? filtered[9] : filtered[filtered.length - 1];    
        if (toSelect) {    
          setSelected(toSelect);    
          setColor(colors[toSelect.code.charCodeAt(0) % colors.length]);    
        }
        setPrevInput(input) 
      } 
    }  
  }, [data, input, colors]);    
  
  if (loading) return <p>Loading...</p>;    
  if (error) return <p>Error :(</p>;    
  
  return (      
    <div>      
      <input      
        value={input}      
        onChange={(e) => setInput(e.target.value)}      
      />      
      <ul>      
        {data?.countries      
          .filter((country: Country) => {
            if (input.includes('search:')) {  
              const searchTerm =  parseSearchSize(input).search;
              return country.code.toLowerCase().includes(searchTerm.toLowerCase()) || country.name.toLowerCase().includes(searchTerm.toLowerCase())  
            } else {  
              return country.name.toLowerCase().includes(input.toLowerCase()) || country.code.toLowerCase().includes(input.toLowerCase())  
            }  
          }).slice(0,size)      
          .map((country: Country, index) => (      
            <li      
              key={country.code}      
              onClick={() => {      
                setSelected(selected === country ? null : country);      
                setColor(colors[index % colors.length]);      
              }}      
              style={{ backgroundColor: selected === country ? color : '#ffffff', cursor: 'pointer' }}      
            >      
              {country.name} {country.emoji}      
            </li>      
          ))}      
      </ul>      
    </div>      
  );    

  
};    
  
const WrappedApp = () => (    
  <ApolloProvider client={client}>    
    <App />    
  </ApolloProvider>    
);    
  
export default WrappedApp;    
