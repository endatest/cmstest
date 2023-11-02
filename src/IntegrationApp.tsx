import { FC, useCallback, useEffect, useState } from 'react';

interface Offer {
  id: string;
  offerCode: string;
  name: string;
}
interface PageState {
  selectedOffer?: Offer; 
  offers?: Offer[];
}

export const IntegrationApp: FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [itemName, setItemName] = useState<string | null>(null);
  const [watchedElementValue, setWatchedElementValue] = useState<string | null>(null);
  // const [selectedAssetNames, setSelectedAssetNames] = useState<ReadonlyArray<string>>([]);
  // const [selectedItemNames, setSelectedItemNames] = useState<ReadonlyArray<string>>([]);
  const [elementValue, setElementValue] = useState<string | null>(null);

  // const [offers, setOffers] = useState([]);
  const [state, setState] = useState<PageState>({
    offers: [],
    selectedOffer: undefined 
  });

  const fetchProductsData = () => {
    fetch('http://localhost:8080/offers', {mode:'cors'})
      .then(response => {
        return response.json()
      })
      .then(data => {
        setState((prevState) => ({
          ...prevState,
          offers: data.electricityOffers,
        }));
      })
  }

  useEffect(() => {
    fetchProductsData();
  }, []);

  const updateWatchedElementValue = useCallback((codename: string) => {
    CustomElement.getElementValue(codename, v => typeof v === 'string' && setWatchedElementValue(v));
  }, []);

  useEffect(() => {
    CustomElement.init((element, context) => {
      if (!isConfig(element.config)) {
        throw new Error('Invalid configuration of the custom element. Please check the documentation.');
      }
      console.log('context', context);
      setConfig(element.config);
      setProjectId(context.projectId);
      setIsDisabled(element.disabled);
      setItemName(context.item.name);
      setElementValue(element.value ?? '');
      if (element.value) {
        setState((prevState) => ({
          ...prevState,
          selectedOffer: JSON.parse(element.value),
        }));
      }
      updateWatchedElementValue(element.config.textElementCodename);
    });
  }, [updateWatchedElementValue]);

  useEffect(() => {
    CustomElement.setHeight(500);
    fetchProductsData();
  }, []);

  useEffect(() => {
    CustomElement.onDisabledChanged(setIsDisabled);
  }, []);

  useEffect(() => {
    CustomElement.observeItemChanges(i => setItemName(i.name));
  }, []);

  useEffect(() => {
    if (!config) {
      return;
    }
    CustomElement.observeElementChanges([config.textElementCodename], () => updateWatchedElementValue(config.textElementCodename));
  }, [config, updateWatchedElementValue]);

  // const selectAssets = () =>
  //   CustomElement.selectAssets({ allowMultiple: true, fileType: 'all' })
  //     .then(ids => CustomElement.getAssetDetails(ids?.map(i => i.id) ?? []))
  //     .then(assets => setSelectedAssetNames(assets?.map(asset => asset.name) ?? []));

  // const selectItems = () =>
  //   CustomElement.selectItems({ allowMultiple: true })
  //     .then(ids => CustomElement.getItemDetails(ids?.map(i => i.id) ?? []))
  //     .then(items => setSelectedItemNames(items?.map(item => item.name) ?? []));

  const selectProductValue = (newValue: string) => {
    const selectedItem = state.offers && state.offers.find((offer) => offer.id === newValue);
    setState((prevState) => ({
      ...prevState,
      selectedOffer: selectedItem,
    }));
  };

  const updateValue = (newValue?: Offer) => {
    const selectedItem = JSON.stringify(newValue)
    CustomElement.setValue(selectedItem);
    setElementValue(selectedItem);
  };

  if (!config || !projectId || elementValue === null || watchedElementValue === null || itemName === null) {
    return null;
  }

 
  const selectedOffer: Offer = JSON.parse(elementValue);
  console.log('selectedOffer:', selectedOffer);

  return (
    <>
      <h1>
        Product Selector
      </h1>
      {/* <section>
        projectId: {projectId}; item name: {itemName}
      </section>
      <section>
        configuration: {JSON.stringify(config)}
      </section> */}
     
      {/* <section>
        This is the watched element: {watchedElementValue}
      </section>
      <section>
        These are your selected asset names: {selectedAssetNames.join(', ')}
        <button onClick={selectAssets}>Select different assets</button>
      </section>
      <section>
        These are your selected item names: {selectedItemNames.join(', ')}
        <button onClick={selectItems}>Select different items</button>
      </section> */}
      {/* {offers.length > 0 && (
        <ul>
          {offers.map(offer=> (
            <li key={offer.id} onClick={e => updateValue(offer.name)}>{offer.name} - {offer.offerCode}</li>
          ))}
        </ul>
      )} */}

      <section>

        <select onChange={e => selectProductValue(e.target.value)} defaultValue={''} value={selectedOffer.id}>
          <option value="" disabled>Choose a Product ...</option>
          {state.offers && state.offers.map(offer=> (
            <option key={offer.id} value={offer.id}>{offer.name} - {offer.offerCode}</option>
          ))}
        </select>
        {state && state.selectedOffer && (
          <>
          <br /><br />
          Id
          <br />
          <input value={state.selectedOffer.id} name="id" onChange={(e)=> {
            const offer = Object.assign({}, state.selectedOffer, {id: e.target.value});
            setState((prevState) => ({
              ...prevState,
              selectedOffer: offer,
            }));
          }} />
          <br /><br />
          name
          <br />
          <input value={state.selectedOffer.name} name="productName" onChange={(e)=> {
            const offer = Object.assign({}, state.selectedOffer, {name: e.target.value});
            setState((prevState) => ({
              ...prevState,
              selectedOffer: offer,
            }));
          }} />
          <br /><br />
          offerCode
          <br />
          <input value={state.selectedOffer.offerCode} name="offerCode" onChange={(e)=> {
            const offer = Object.assign({}, state.selectedOffer, {offerCode: e.target.value});
            setState((prevState) => ({
              ...prevState,
              selectedOffer: offer,
            }));
          }} />
          <br /><br />
          <button onClick={() => updateValue(state.selectedOffer)}>Save</button>
          </>
        )}
      </section>
      {/* <textarea cols={100} rows={20}>
        {elementValue}
      </textarea> */}
      <section>
      <br/><br/>
        debug:<br/><br/>
        <textarea rows={10} cols={100} defaultValue={elementValue}></textarea>
        {/* <input defaultValue={elementValue} disabled={isDisabled} /> */}
      </section>

    </>
  );
};

IntegrationApp.displayName = 'IntegrationApp';

type Config = Readonly<{
  // expected custom element's configuration
  textElementCodename: string;
}>;

// check it is the expected configuration
const isConfig = (v: unknown): v is Config =>
  isObject(v) &&
  hasProperty(nameOf<Config>('textElementCodename'), v) &&
  typeof v.textElementCodename === 'string';

const hasProperty = <PropName extends string, Input extends {}>(propName: PropName, v: Input): v is Input & { [key in PropName]: unknown } =>
  v.hasOwnProperty(propName);

const isObject = (v: unknown): v is {} =>
  typeof v === 'object' &&
  v !== null;

const nameOf = <Obj extends Readonly<Record<string, unknown>>>(prop: keyof Obj) => prop;
