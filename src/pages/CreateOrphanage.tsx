import React, { useCallback, useState, FormEvent, ChangeEvent } from 'react';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import { useHistory } from 'react-router-dom';

import { FiPlus } from 'react-icons/fi';
import { IoIosClose } from 'react-icons/io';
import Sidebar from '../components/Sidebar';
import mapIcon from '../utils/mapIcon';
import api from '../services/api';

import '../styles/pages/create-orphanage.css';

const CreateOrphanage: React.FC = () => {
  const history = useHistory();

  const [position, setPosition] = useState({ latitude: 0, longitude: 0 });

  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [instructions, setInstructions] = useState('');
  const [opening_hours, setOpeningHours] = useState('');
  const [open_on_weekends, setOpenOnWeekends] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleMapClick = useCallback((event: LeafletMouseEvent) => {
    const { lat, lng } = event.latlng;

    setPosition({
      latitude: lat,
      longitude: lng,
    });
  }, []);

  const handleSelectImages = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) {
        return;
      }

      const selectedImages = Array.from(event.target.files);

      setImages(selectedImages);

      const selectedImagesPreview = selectedImages.map(image => {
        return URL.createObjectURL(image);
      });

      const totalPreviews = previewImages.concat(selectedImagesPreview);
      setPreviewImages(totalPreviews);
    },
    [previewImages],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const { latitude, longitude } = position;

      const data = new FormData();

      data.append('name', name);
      data.append('about', about);
      data.append('latitude', String(latitude));
      data.append('longitude', String(longitude));
      data.append('instructions', instructions);
      data.append('opening_hours', opening_hours);
      data.append('open_on_weekends', String(open_on_weekends));

      images.forEach(image => {
        data.append('images', image);
      });

      await api.post('orphanages', data);

      history.push('/app');
    },
    [
      name,
      about,
      position,
      instructions,
      opening_hours,
      open_on_weekends,
      images,
      history,
    ],
  );

  return (
    <div id="page-create-orphanage">
      <Sidebar />

      <main>
        <form className="create-orphanage-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Dados</legend>

            <Map
              center={[-5.9140495, -35.2775334]}
              style={{ width: '100%', height: 280 }}
              zoom={15}
              onClick={handleMapClick}
            >
              <TileLayer
                url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
              />

              {position.latitude !== 0 && (
                <Marker
                  interactive={false}
                  icon={mapIcon}
                  position={[position.latitude, position.longitude]}
                />
              )}
            </Map>

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                value={name}
                onChange={event => {
                  setName(event.target.value);
                }}
              />
            </div>

            <div className="input-block">
              <label htmlFor="about">
                Sobre {'  '}
                <span>Máximo de 300 caracteres</span>
              </label>
              <textarea
                id="name"
                maxLength={300}
                value={about}
                onChange={e => {
                  setAbout(e.target.value);
                }}
              />
            </div>

            <div className="input-block">
              <label htmlFor="images">Fotos</label>

              <div className="images-container">
                {previewImages.map(image => {
                  return (
                    <div className="squad-image">
                      <button type="button" className="close-image">
                        <IoIosClose size={50} color="#FF669D" />
                      </button>
                      <img key={image} src={image} alt={name} />
                    </div>
                  );
                })}

                <label htmlFor="image[]" className="new-image">
                  <FiPlus size={24} color="#15b6d6" />
                </label>
              </div>
              <input
                multiple
                onChange={handleSelectImages}
                type="file"
                id="image[]"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Visitação</legend>

            <div className="input-block">
              <label htmlFor="instructions">Instruções</label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={event => {
                  setInstructions(event.target.value);
                }}
              />
            </div>

            <div className="input-block">
              <label htmlFor="opening_hours">Horário de Funcionamento</label>
              <input
                id="opening_hours"
                value={opening_hours}
                onChange={event => {
                  setOpeningHours(event.target.value);
                }}
              />
            </div>

            <div className="input-block">
              <label htmlFor="open_on_weekends">Atende fim de semana</label>

              <div className="button-select">
                <button
                  type="button"
                  className={open_on_weekends ? 'active' : ''}
                  onClick={() => setOpenOnWeekends(true)}
                >
                  Sim
                </button>
                <button
                  type="button"
                  className={!open_on_weekends ? 'active' : ''}
                  onClick={() => setOpenOnWeekends(false)}
                >
                  Não
                </button>
              </div>
            </div>
          </fieldset>

          <button className="confirm-button" type="submit">
            Confirmar
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateOrphanage;
